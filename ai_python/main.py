from pyscript import workers, when # type: ignore
from pyscript.web import page # type: ignore
from js import console, localStorage # type: ignore

# Clé pour le stockage
STORAGE_KEY = "groq_api_key"

page["#question"].disabled = True  # Désactiver le champ de question tant que la clé n'est pas configurée
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

# Charger la clé au démarrage si elle existe
async def lire_cle_sauvegarde():
    """Charge la clé API sauvegardée au démarrage"""
    try:
        cle_sauvegarde = localStorage.getItem(STORAGE_KEY)
        if cle_sauvegarde and cle_sauvegarde != "null":
            worker = await workers["ia"]
            await worker.set_api_key(cle_sauvegarde)
            page["#cle_ia"].setAttribute("placeholder", "Clé API déjà enregistrée")
            page["#question"].disabled = False
            console.log("Clé API chargée depuis localStorage")
    except Exception as e:
        console.error("Erreur lors du chargement de la clé:", str(e))

# Charger la clé au démarrage
lire_cle_sauvegarde()

@when("click", "#cle_btn")
async def cle_storage(event):
    """Sauvegarde la clé API dans localStorage ET dans le worker"""
    try:
        cle = page["#cle_ia"].value
        
        if not cle or not cle.strip():
            console.log("Erreur: Clé API vide")
            return
        
        console.log("Tentative de sauvegarde de la clé API...")
        
        # Sauvegarder dans localStorage (thread principal)
        localStorage.setItem(STORAGE_KEY, cle.strip())
        
        # Envoyer au worker
        worker = await workers["ia"]
        success = await worker.set_api_key(cle)
        
        if success:
            console.log("Clé API sauvegardée avec succès")
            # Effacer le champ de saisie pour la sécurité
            page["#cle_ia"].value = ""
            page["#cle_ia"].setAttribute("placeholder", "Clé API enregistrée")
            page["#question"].disabled = False  # Désactiver le champ de question tant que la clé n'est pas validée
            page["#cle_ia"].disabled = True  # Masquer le champ de saisie après validation
            page["#cle_btn"].disabled = True  # Masquer le bouton de validation après validation
            page["#question"].focus()  # Placer le focus sur le champ de question
            alert = page["#alert_info"]
            alert.classList.add("fade-out")
        else:
            console.log("Erreur lors de la sauvegarde de la clé dans le worker")
        
    except Exception as e:
        console.error("Erreur lors de la sauvegarde de la clé API:", str(e))


@when("click", "#reponse_btn")
async def generer_reponse(event):
    """Génère le code Python via l'API Groq"""
    try:
        worker = await workers["ia"]
        
        question = page["#question"].value
        
        if not question or not question.strip():
            editor.code = "# Veuillez poser une question pour générer du code Python."
            return
        
        console.log("Question:", question)
        
        # Afficher un message de chargement
        editor.code = "# Génération du code en cours..."
        
        # Appeler la fonction de génération
        reponse = await worker.generer_code(question)
        
        # Afficher la réponse dans l'éditeur
        editor.code = reponse
        
    except Exception as e:
        console.error("Erreur:", str(e))
        editor.code = f"# Erreur: {str(e)}"

