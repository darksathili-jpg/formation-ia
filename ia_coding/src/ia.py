import js # type: ignore
import requests
import src.env as env # type: ignore
import src.pre_prompt as pre # type: ignore

# Cache des clés API par provider
_api_keys_cache = {}

# Provider sélectionné par l'utilisateur (None = mode auto/fallback)
_selected_provider_id = None


def set_api_key(api_key: str, provider_key: str = "GROQ_API_KEY") -> bool:
    """Stocke une clé API en mémoire pour un provider donné"""
    global _api_keys_cache
    if api_key and api_key.strip():
        _api_keys_cache[provider_key] = api_key.strip()
        return True
    return False

def get_api_key(provider_key: str = "GROQ_API_KEY") -> str:
    """Récupère la clé API d'un provider depuis le cache"""
    return _api_keys_cache.get(provider_key, "")

def clear_api_key(provider_key: str = "GROQ_API_KEY") -> bool:
    """Efface la clé API d'un provider du cache"""
    if provider_key in _api_keys_cache:
        del _api_keys_cache[provider_key]
    return True

def clear_all_keys() -> bool:
    """Efface toutes les clés API du cache"""
    global _api_keys_cache
    _api_keys_cache = {}
    return True

def set_selected_provider(provider_id: str) -> bool:
    """Définit le provider préféré. 'auto' = mode fallback automatique"""
    global _selected_provider_id
    _selected_provider_id = None if provider_id == "auto" else provider_id
    return True

def get_providers_list() -> list:
    """Retourne la liste des providers disponibles avec leur état (clé présente ou non)"""
    result = []
    for p in env.PROVIDERS:
        result.append({
            "id": p["id"],
            "name": p["name"],
            "has_key": bool(_api_keys_cache.get(p["api_key_env"], ""))
        })
    return result


def _construire_ligne_choix(provider: dict, numero: int, echecs: list) -> str:
    """
    Construit la ligne 'Choix' à injecter dans l'en-tête du code généré.
    Explique de façon transparente pourquoi ce provider a été retenu.
    """
    if _selected_provider_id:
        return "Sélectionné manuellement par l'utilisateur via le menu déroulant"

    if not echecs:
        return (
            f"Mode auto — provider n°{numero} retenu en priorité, "
            "aucun fallback nécessaire (disponible et clé valide)"
        )

    liste_echecs = ", ".join(echecs)
    return (
        f"Mode auto — fallback vers provider n°{numero} ({provider['name']}) "
        f"car les providers précédents ont échoué ou atteint leur limite : "
        f"{liste_echecs}"
    )


def _construire_payload(question: str, provider: dict) -> dict:
    """
    Construit le payload de la requête.
    Les métadonnées du provider sont gérées séparément (barre d'état UI).
    """
    return {
        "model": provider["model"],
        "messages": [
            {"role": "system", "content": pre.system_prompt},
            {"role": "user", "content": question}
        ],
        "max_tokens": 2048,
        "temperature": 0.3,
        "top_p": 0.9,
        "stream": False
    }


def _appeler_provider(question: str, provider: dict, numero: int, echecs: list) -> tuple:
    """
    Tente d'appeler un provider spécifique.
    Retourne (code, None) si succès, (None, raison) si échec.
    """
    api_key = _api_keys_cache.get(provider["api_key_env"], "")
    if not api_key:
        return None, "pas de clé API configurée"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = _construire_payload(question, provider)

    try:
        response = requests.post(provider["url"], headers=headers, json=payload, timeout=30)

        if response.status_code == 200:
            resultat = response.json()
            code = resultat["choices"][0]["message"]["content"]
            return code, None
        elif response.status_code == 401:
            return None, "clé API invalide (HTTP 401)"
        elif response.status_code == 429:
            return None, "limite de requêtes atteinte (HTTP 429 — rate limit)"
        elif response.status_code == 503:
            return None, "service temporairement indisponible (HTTP 503)"
        else:
            return None, f"erreur HTTP {response.status_code}"

    except requests.exceptions.Timeout:
        return None, "délai d'attente dépassé (timeout 30s)"
    except Exception as e:
        return None, f"erreur réseau : {str(e)}"


def generer_code(question: str) -> str:
    """
    Génère du code Python NSI via les providers disponibles.

    Logique de sélection du modèle :
    1. Si un provider est choisi manuellement → priorité à ce provider,
       fallback sur les autres si nécessaire.
    2. En mode auto → on parcourt les providers dans l'ordre de priorité
       et on retient le premier qui répond avec succès.

    Le nom du modèle utilisé et la raison du choix sont injectés dans
    le message pour apparaître dans l'en-tête commenté du code généré.
    """
    if not question or not question.strip():
        return "# Vous devez formuler une question pour générer du code Python NSI."

    if not _api_keys_cache:
        return (
            "# Erreur : Aucune clé API configurée.\n"
            "# Veuillez entrer au moins une clé API et cliquer sur 'Valider'."
        )

    # Construire la liste des providers à essayer dans l'ordre
    if _selected_provider_id:
        providers_a_essayer = sorted(
            env.PROVIDERS,
            key=lambda p: (0 if p["id"] == _selected_provider_id else 1)
        )
    else:
        providers_a_essayer = env.PROVIDERS

    echecs = []  # Providers tentés sans succès avec leur raison d'échec

    for numero, provider in enumerate(providers_a_essayer, start=1):
        if not _api_keys_cache.get(provider["api_key_env"], ""):
            continue  # Pas de clé → skip silencieux

        code, raison_echec = _appeler_provider(question, provider, numero, echecs)

        if code is not None:
            ligne_choix = _construire_ligne_choix(provider, numero, echecs)
            return {
                "code": code,
                "modele": provider["name"],
                "modele_id": provider["model"],
                "choix": ligne_choix
            }

        echecs.append(f"{provider['name']} ({raison_echec})")

    # Tous les providers ont échoué
    if not echecs:
        return {"code": "# Aucun provider n'a de clé API configurée.\n# Ajoutez au moins une clé dans le formulaire (accordéon).", "modele": "", "modele_id": "", "choix": ""}

    details = "\n# ".join(echecs)
    return {"code": f"# Tous les providers ont échoué :\n# {details}\n# Vérifiez vos clés API ou réessayez.", "modele": "", "modele_id": "", "choix": "Tous les providers ont échoué"}


__export__ = [
    "generer_code",
    "set_api_key",
    "get_api_key",
    "clear_api_key",
    "clear_all_keys",
    "set_selected_provider",
    "get_providers_list"
]
