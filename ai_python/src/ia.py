import js # type: ignore
import requests
import src.env as env # type: ignore
import src.pre_prompt as pre # type: ignore

# Variable globale pour stocker la clé pendant l'exécution du worker
_api_key_cache = None

def set_api_key(api_key):
    """Stocke la clé API en mémoire"""
    global _api_key_cache
    if api_key and api_key.strip():
        _api_key_cache = api_key.strip()
        return True
    return False
    
def get_api_key():
    """Récupère la clé API depuis le cache"""
    global _api_key_cache
    return _api_key_cache

def clear_api_key():
    """Efface la clé API du cache"""
    global _api_key_cache
    _api_key_cache = None
    return True

def modele_ia(question, api_key, modele="llama-3.3-70b-versatile"):
    return {
        "model": modele,
        "messages": [
            {"role": "system", "content": pre.system_prompt},
            {"role": "user", "content": question}
        ],
        "max_tokens": 2048,
        "temperature": 0.3,
        "top_p": 0.9,
        "stream": False  # Changé à False pour simplifier
    }

def generer_code(question):
    """Génère du code Python via l'API Groq"""
    
    if not question:
        return "# Vous devez formuler une question pour générer du code Python adapté au programme de NSI."
    
    # Récupérer la clé API depuis localStorage
    api_key = get_api_key()
    
    if not api_key:
        return "# Erreur : Aucune clé API Groq configurée.\n# Veuillez entrer votre clé API et cliquer sur 'Valider'."
    
    # Préparer les headers avec la clé récupérée
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = modele_ia(question, api_key)

    try:
        response = requests.post(env.URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            resultat = response.json()
            code_genere = resultat["choices"][0]["message"]["content"]
            return code_genere
        elif response.status_code == 401:
            return "# Erreur : Clé API invalide.\n# Vérifiez votre clé Groq et réessayez."
        else:
            return f"# Erreur {response.status_code}: {response.text}"
        
    except requests.exceptions.Timeout:
        return "# Erreur : Délai d'attente dépassé.\n# Veuillez réessayer."
    except Exception as e:
        return f"# Erreur de traitement: {str(e)}"

__export__ = ["generer_code", "set_api_key", "get_api_key", "clear_api_key"]