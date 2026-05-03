from pyscript import workers, when # type: ignore
from pyscript.web import page # type: ignore
from js import console, localStorage, document # type: ignore

# Clés de stockage par provider
STORAGE_KEYS = {
    "GROQ_API_KEY":      "groq_api_key",
    "CEREBRAS_API_KEY":  "cerebras_api_key",
    "GOOGLE_API_KEY":    "google_api_key",
}

page["#question"].disabled = True

editor = page["editeur"]
editor.code = """def tri_insertion(liste: list) -> list:
    # Parcourir la liste à partir du deuxième élément       
    for i in range(1, len(liste)):
        # Stocker la valeur actuelle
        key = liste[i]
        j = i - 1
        
        # Déplacer les éléments de la partie triée qui sont plus grands que key
        while j >= 0 and liste[j] > key:
            liste[j + 1] = liste[j]
            j -= 1
        
        # Placer key à sa position correcte
        liste[j + 1] = key
    return liste

print(tri_insertion([5, 2, 9, 1]))
"""

async def lire_cles_sauvegardees():
    """Charge toutes les clés API sauvegardées au démarrage"""
    try:
        worker = await workers["ia"]
        nb_cles = 0
        for env_key, storage_key in STORAGE_KEYS.items():
            cle_sauvegarde = localStorage.getItem(storage_key)
            if cle_sauvegarde and cle_sauvegarde != "null":
                await worker.set_api_key(cle_sauvegarde, env_key)
                nb_cles += 1
                console.log(f"Clé {env_key} chargée depuis localStorage")

        if nb_cles > 0:
            page["#question"].disabled = False
            alert = page["#alert_info"]
            alert.classList.add("fade-out")
            # Mettre à jour l'indicateur de statut des clés
            await rafraichir_statut_providers()

    except Exception as e:
        console.error("Erreur lors du chargement des clés:", str(e))

async def rafraichir_statut_providers():
    """Met à jour visuellement l'état des clés par provider"""
    try:
        worker = await workers["ia"]
        providers = await worker.get_providers_list()
        # Mettre à jour les badges de statut dans le formulaire
        for p in providers:
            badge_id = f"#badge_{p['id']}"
            badge = page[badge_id]
            if badge:
                if p["has_key"]:
                    badge.classList.remove("bg-danger")
                    badge.classList.add("bg-success")
                    badge.textContent = "Clé OK"
                else:
                    badge.classList.remove("bg-success")
                    badge.classList.add("bg-danger")
                    badge.textContent = "Pas de clé"
    except Exception as e:
        console.error("Erreur rafraichir_statut:", str(e))

lire_cles_sauvegardees()

@when("click", "#cle_btn")
async def cle_storage(event):
    """Sauvegarde toutes les clés API saisies"""
    try:
        worker = await workers["ia"]
        nb_cles_ajoutees = 0

        for env_key, storage_key in STORAGE_KEYS.items():
            input_id = f"#cle_{env_key.lower()}"
            input_el = page[input_id]
            if not input_el:
                continue
            cle = input_el.value
            if cle and cle.strip():
                localStorage.setItem(storage_key, cle.strip())
                await worker.set_api_key(cle.strip(), env_key)
                input_el.value = ""
                input_el.setAttribute("placeholder", "Clé enregistrée")
                nb_cles_ajoutees += 1
                console.log(f"Clé {env_key} sauvegardée")

        if nb_cles_ajoutees > 0:
            page["#question"].disabled = False
            page["#question"].focus()
            alert = page["#alert_info"]
            alert.classList.add("fade-out")
            await rafraichir_statut_providers()
        else:
            console.log("Aucune clé saisie")

    except Exception as e:
        console.error("Erreur lors de la sauvegarde des clés:", str(e))

@when("change", "#provider_select")
async def changer_provider(event):
    """Change le provider préféré"""
    try:
        worker = await workers["ia"]
        provider_id = page["#provider_select"].value
        await worker.set_selected_provider(provider_id)
        console.log(f"Provider sélectionné : {provider_id}")
    except Exception as e:
        console.error("Erreur changement provider:", str(e))

@when("click", "#reponse_btn")
async def generer_reponse(event):
    """Génère le code Python via le provider sélectionné ou en fallback"""
    try:
        worker = await workers["ia"]
        question = page["#question"].value

        if not question or not question.strip():
            editor.code = "# Veuillez poser une question pour générer du code Python."
            return

        console.log("Question:", question)
        editor.code = "# Génération du code en cours..."

        _barre = document.getElementById("barre_modele")
        if _barre:
            _barre.style.display = "none"

        resultat = await worker.generer_code(question)

        # Afficher le code dans l'éditeur
        editor.code = resultat["code"]

        # Mettre à jour la barre d'état — utiliser document.getElementById
        # (page[] retourne une collection PyScript, pas l'élément directement)

        barre       = document.getElementById("barre_modele")
        barre_texte = document.getElementById("barre_modele_texte")

        if resultat["modele"] and barre and barre_texte:
            barre_texte.textContent = (
                f"{resultat['modele']}  ({resultat['modele_id']})"
                f"  —  {resultat['choix']}"
            )
            barre.style.display = "flex"
        elif barre:
            barre.style.display = "none"

    except Exception as e:
        console.error("Erreur:", str(e))
        editor.code = f"# Erreur: {str(e)}"
