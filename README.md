# Formation IA — NSI

**L'Intelligence Artificielle au service de l'enseignement NSI**  
Formation pratique en 3 niveaux progressifs — Lycée Antoine Watteau, Valenciennes

![Statut](https://img.shields.io/badge/statut-actif-brightgreen)
![Année](https://img.shields.io/badge/année-2025--2026-blue)
![Niveau](https://img.shields.io/badge/spécialité-NSI-blueviolet)
![Durée](https://img.shields.io/badge/durée-14h-orange)
![Licence](https://img.shields.io/badge/licence-libre-lightgrey)

---

## Table des matières

- [À propos](#à-propos)
- [Structure du projet](#structure-du-projet)
- [Programme de formation](#programme-de-formation)
- [Méthode RCTF](#méthode-rctf)
- [Activités pédagogiques](#activités-pédagogiques)
- [Projets & expérimentations](#projets--expérimentations)
- [Outils recommandés](#outils-recommandés)
- [Ressources](#ressources)
- [Auteur](#auteur)

---

## À propos

Ce dépôt accompagne le site [darksathili.kesug.com](https://darksathili.kesug.com), une ressource pédagogique destinée aux **enseignants de la spécialité NSI** (Numérique et Sciences Informatiques) souhaitant intégrer l'intelligence artificielle dans leur pratique de classe.

Le projet propose :

- une **formation progressive en 3 niveaux** (14h au total), de la découverte des LLM jusqu'à la conception de projets élèves autonomes ;
- des **activités prêtes à l'emploi** pour la classe (Première, Terminale) ;
- une **méthode de prompt engineering** structurée (RCTF) ;
- une sélection de **ressources francophones** de référence sur l'IA et son cadre légal.

> Ce contenu est un point de départ — les ressources sont à tester et à adapter selon votre classe et vos objectifs pédagogiques.

---

## Structure du projet

```
.
├── index.html                          # Page d'accueil
├── formation_ia/
│   ├── niveau1.html                    # Niveau 1 — Débutant
│   ├── niveau2.html                    # Niveau 2 — Intermédiaire
│   └── niveau3.html                    # Niveau 3 — Avancé
├── activités/
│   ├── perceptron/
│   ├── chat_chien/
│   ├── similarite_images/
│   ├── embeddings/
│   ├── mse_learningRate/
│   └── li/
├── pages/
│   ├── resume_ia.html                  # Histoire & futur de l'IA
│   ├── cinq_grandes_idees_IA_NSI.html
│   ├── world_models_nsi.html
│   ├── fiche_technique_NSI_v5_1.html
│   └── synth_vs_common_crawl.html      # Projet Baguettotron
├── anatomie_prompt/
│   └── anatomie_prompt_NSI.html
├── application_prompt/
│   └── generateur-prompts-nsi-maths.html
├── documents/
│   └── SlidesVideoIA_formation.pdf
└── ia_coding/                          # Projet DarkSATHI Li IA
```

---

## Programme de formation

La formation est organisée en **3 niveaux progressifs** pour un total de **14 heures**.

### Niveau 1 — Découverte `3h30` `Débutant`

| Thème | Contenu |
|-------|---------|
| Fonctionnement des LLM | Prédiction de tokens, génération de texte |
| Prompt structuré | Méthode RCTF : Rôle, Contexte, Tâche, Format |
| Usage en NSI | Générer exercices, corrigés et supports de cours |
| Esprit critique | Identifier les hallucinations & enjeux RGPD |

→ [Accéder au Niveau 1](formation_ia/niveau1.html)

---

### Niveau 2 — IA Générative Appliquée `2 × 3h30` `Intermédiaire`

Prérequis : Niveau 1

| Thème | Contenu |
|-------|---------|
| Techniques avancées | Few-shot prompting, Chain-of-Thought |
| Ingénierie pédagogique | Concevoir des séquences complètes avec l'IA |
| Production de supports | TP, évaluations, fiches de révision |
| Contrôle qualité | Vérification systématique des sorties IA |

→ [Accéder au Niveau 2](formation_ia/niveau2.html)

---

### Niveau 3 — De l'Outil à l'Expertise `2 × 3h30` `Avancé`

Prérequis : Niveaux 1 & 2

| Thème | Contenu |
|-------|---------|
| Architecture | Fonctionnement des transformers |
| Projets élèves | Conception de projets autonomes avec l'IA |
| Techniques avancées | Fine-tuning, RAG, agents IA |
| Cadre institutionnel | IA Act européen & devenir référent IA en lycée |

→ [Accéder au Niveau 3](formation_ia/niveau3.html)

---

## Méthode RCTF

La méthode **RCTF** est un cadre en 4 composantes pour rédiger des prompts pédagogiques efficaces et reproductibles.

| Composante | Rôle | Exemple |
|------------|------|---------|
| **R** — Rôle | Définir l'identité de l'IA | *"Tu es un professeur de NSI Terminale."* |
| **C** — Contexte | Décrire la situation | *"Pour une classe de 25 élèves de niveau intermédiaire,"* |
| **T** — Tâche | Formuler la demande | *"génère un exercice sur l'algorithme de Dijkstra :"* |
| **F** — Format | Préciser la forme attendue | *"graphe ASCII 6 nœuds, 3 questions guidées, corrigé Python commenté avec complexité."* |

**Prompt complet :**

```
Tu es un professeur de NSI Terminale.
Pour une classe de 25 élèves de niveau intermédiaire,
génère un exercice sur Dijkstra :
graphe ASCII 6 nœuds, 3 questions guidées,
corrigé Python commenté avec complexité.
```

> Si le résultat ne convient pas, précisez davantage et relancez. L'IA améliore sa réponse à chaque reformulation du prompt.

Ressource associée : [Anatomie d'un prompt NSI](anatomie_prompt/anatomie_prompt_NSI.html)

---

## Activités pédagogiques

Activités clé en main pour la classe, conçues pour être **testées par l'enseignant avant diffusion aux élèves**.

| Activité | Niveaux | Lien |
|----------|---------|------|
| À la découverte du perceptron | Terminale | [→](activités/perceptron/tp_neurone.html) |
| Réseau de neurones — Chats vs Chiens | Terminale | [→](activités/chat_chien/tp_reseaux_neurones_complet.html) |
| Similarité d'images par vecteurs | Première / Terminale | [→](activités/similarite_images/activite_similarite_images.html) |
| Word Embeddings & Python | Première / Terminale | [→](activités/embeddings/activite_eleve_word_embeddings.html) |
| MSE & Learning Rate | Seconde / Première / Terminale | [→](activités/mse_learningRate/activite_eleve_mse_learning_rate.html) |
| World Models — Yann LeCun | Terminale | [→](pages/world_models_nsi.html) |
| Li — Assistant vocal IA *(hors programme)* | Terminale | [→](activités/li/tp_li_nsi_v3.html) |

---

## Projets & expérimentations

| Projet | Description | Lien |
|--------|-------------|------|
| **Baguettotron** | SLM français souverain — données synthétiques vs Common Crawl | [→](pages/synth_vs_common_crawl.html) |
| **Les 5 grandes idées en IA** | Synthèse des concepts fondamentaux pour NSI | [→](pages/cinq_grandes_idees_IA_NSI.html) |
| **Projet Watteau — IA embarquée** | Fiche technique du projet du lycée Watteau | [→](pages/fiche_technique_NSI_v5_1.html) |
| **DarkSATHI Li IA** | Expérimentations de codage assisté par IA | [→](ia_coding/) |
| **Générateur de prompts NSI & Maths** | Application interactive de génération de prompts | [→](application_prompt/generateur-prompts-nsi-maths.html) |

---

## Outils recommandés

### Modèles de langage

| Modèle | Fournisseur | Conformité | Lien |
|--------|-------------|------------|------|
| Le Chat | Mistral AI | ✅ RGPD | [chat.mistral.ai](https://chat.mistral.ai) |
| ChatGPT | OpenAI | Gratuit / Pro | [chatgpt.com](https://chatgpt.com) |
| Claude | Anthropic | Raisonnement avancé | [claude.ai](https://claude.ai) |
| Groq / Llama 3 | Groq | API haute vitesse | [console.groq.com](https://console.groq.com) |
| Ollama | Communauté | 🔒 100 % local | [ollama.com](https://ollama.com) |

### Outils pédagogiques

| Outil | Description |
|-------|-------------|
| [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) | Visualisation interactive des transformers |
| [LLM Visualizer](https://bbycroft.net/llm) | Vue 3D du fonctionnement interne d'un LLM |
| [Elements of AI](https://www.elementsofai.fr/) | Cours IA accessible pour lycéens |
| [Common Crawl](https://commoncrawl.org/get-started) | Archive ouverte du web pour comprendre les données d'entraînement |
| [ConvNetJS](https://cs.stanford.edu/people/karpathy/convnetjs/) | Apprentissage d'un réseau de neurones en temps réel |
| [Quick, Draw!](https://quickdraw.withgoogle.com/) | Démonstration ludique de la reconnaissance visuelle par IA |

---

## Ressources

### Institutionnelles & pédagogiques

| Ressource | Type |
|-----------|------|
| [Éduscol — Se former et enseigner avec l'IA](https://eduscol.education.fr/2285/se-former-et-enseigner-avec-lia) | Ministère de l'Éducation Nationale |
| [Pixees.fr](https://pixees.fr) | Ressources NSI & IA officielles |
| [FUN MOOC — cours IA](https://www.fun-mooc.fr) | MOOCs en français, gratuits |
| [CNRS Formation Fidle](https://www.youtube.com/c/CNRSFormationFIDLE) | Vidéos de formation IA en français |

### Éthique & cadre légal

| Ressource | Thème |
|-----------|-------|
| [CNIL — IA & données personnelles](https://www.cnil.fr/fr/intelligence-artificielle) | RGPD, données, IA |
| [Éduscol — Vademecum "IA et éducation"](https://eduscol.education.fr) | Cadre institutionnel |
| [AI4K12](https://ai4k12.org) | 5 grands concepts de l'IA pour l'enseignement K-12 |

---

## Auteur

**DarkSATHI Li**  
Enseignant de spécialité NSI — Lycée Antoine Watteau, Valenciennes  
Site personnel : [darksathili.kesug.com](https://darksathili.kesug.com)

> Ce projet a été co-conçu avec [Claude](https://claude.ai), assistant IA développé par [Anthropic](https://www.anthropic.com).

---

*Les ressources de ce site sont partagées librement dans un esprit de collaboration enseignante. Elles sont susceptibles de contenir des erreurs ou imprécisions — toute suggestion d'amélioration est la bienvenue.*
