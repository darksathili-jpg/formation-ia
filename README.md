# Formation IA — NSI · DarkSATHI Li

> **L'Intelligence Artificielle au service de l'enseignement NSI**  
> Formation pratique en 3 niveaux progressifs — Lycée Antoine Watteau, Valenciennes

🌐 **Site :** [darksathili.kesug.com](https://darksathili.kesug.com)  
✍️ **Auteur :** DarkSATHI Li — Enseignant NSI, Lycée Watteau, Valenciennes  
📅 **Année :** 2025-2026  
🤝 **Co-conçu avec :** [Claude](https://claude.ai) — IA développée par [Anthropic](https://www.anthropic.com)

---

## À propos

Ce site est une ressource pédagogique dédiée aux **enseignants de la spécialité NSI** (Numérique et Sciences Informatiques) souhaitant intégrer l'intelligence artificielle dans leur pratique de classe. Il propose une formation progressive en 3 niveaux (14h au total), des activités prêtes à l'emploi, des outils de prompt engineering et une sélection de ressources francophones de référence.

> *"Je ne suis pas un expert de l'IA, juste un enseignant passionné qui partage ses découvertes et expérimentations."*

---

## Contenu du site

### 🕰️ L'évolution de l'IA
Synthèse historique et prospective de l'IA, basée sur les ressources du **CNRS Fidle**. Accessible via la page dédiée [`pages/resume_ia.html`](pages/resume_ia.html).

---

### 📐 Les mathématiques de l'IA
Ressources orientées **Terminale spécialité mathématiques**, en partenariat avec [MathAData](https://mathadata.fr/fr) :

- Vidéo (49 min) : *Mathématiques de l'IA*
- Diapositives téléchargeables couvrant :
  - Algorithmes d'IA par apprentissage statistique
  - Comprendre l'IA avec les maths du lycée
  - Les réseaux de neurones
  - Enseigner les maths avec des défis d'IA

---

### 🎓 Les 3 niveaux de formation — 14h au total

#### Niveau 1 — Débutant · 3h30 · Ateliers pratiques
- Comprendre les LLM (prédiction de tokens)
- Prompts RCTF : Rôle, Contexte, Tâche, Format
- Générer exercices et corrigés NSI
- Identifier les hallucinations & enjeux RGPD

#### Niveau 2 — Intermédiaire · 2 × 3h30 · Prérequis : Niveau 1
- Few-shot & Chain-of-Thought avancés
- Séquences pédagogiques complètes
- Générer TP, évaluations, supports de révision
- Vérification systématique des sorties IA

#### Niveau 3 — Avancé · 2 × 3h30 · Prérequis : Niveaux 1 & 2
- Fonctionnement des transformers
- Projets élèves autonomes avec l'IA
- Fine-tuning, RAG, agents IA
- IA Act & devenir référent IA en lycée

---

### ✍️ Prompt Engineering
Introduction à la pratique du **prompt engineering** pour enseignants NSI : concevoir, tester et améliorer les consignes données à une IA.

- Ressource : [Anatomie d'un prompt](anatomie_prompt/anatomie_prompt_NSI.html)

---

### 🧩 Méthode RCTF
Méthode structurée en **4 ingrédients** pour rédiger des prompts pédagogiques efficaces :

| Lettre | Élément | Exemple |
|--------|---------|---------|
| **R** | Rôle | *"Tu es un prof de NSI Terminale..."* |
| **C** | Contexte | *"...pour 25 élèves de niveau intermédiaire..."* |
| **T** | Tâche | *"...génère un exercice sur l'algorithme BFS..."* |
| **F** | Format | *"...avec graphe ASCII et corrigé Python commenté."* |

> **Astuce :** Si le résultat ne convient pas, itérez — précisez davantage. L'IA améliore sa réponse à chaque reformulation du prompt.

---

### 🧪 Activités IA pour la classe

Activités prêtes à l'emploi, à adapter selon votre classe et vos objectifs pédagogiques :

| Activité | Niveau |
|----------|--------|
| [À la découverte du perceptron](activités/perceptron/tp_neurone.html) | Terminale |
| [Réseau de neurones : Chats vs Chiens](activités/chat_chien/tp_reseaux_neurones_complet.html) | Terminale |
| [Similarité d'images par vecteurs](activités/similarite_images/activite_similarite_images.html) | Première / Terminale |
| [Word Embeddings & Python](activités/embeddings/activite_eleve_word_embeddings.html) | Première / Terminale |
| [MSE & Learning Rate](activités/mse_learningRate/activite_eleve_mse_learning_rate.html) | Seconde / Première / Terminale |
| [World Models : Yann LeCun](pages/world_models_nsi.html) | Terminale |
| [Li : Ton assistant vocal IA dans ta poche](activités/li/tp_li_nsi_v3.html) ⚠️ Hors programme | Terminale |

---

### 🔬 Projets de recherche & expérimentations

| Projet | Description |
|--------|-------------|
| [Baguettotron](pages/synth_vs_common_crawl.html) | SLM français souverain — données synthétiques vs Common Crawl |
| [Les 5 grandes idées en IA](pages/cinq_grandes_idees_IA_NSI.html) | Synthèse des concepts fondamentaux pour NSI |
| [Projet Watteau — IA embarquée](pages/fiche_technique_NSI_v5_1.html) | Fiche technique du projet de lycée |
| [Projet DarkSATHI Li IA](ia_coding/) | Expérimentations de codage assisté par IA |
| [Générateur de prompts NSI & Maths](application_prompt/generateur-prompts-nsi-maths.html) | Outil interactif de génération de prompts |

---

### 🛠️ Outils recommandés

**Modèles IA — classés par conformité RGPD :**

| Modèle | Lien | Note |
|--------|------|------|
| Le Chat — Mistral AI | [chat.mistral.ai](https://chat.mistral.ai) | ✅ RGPD |
| ChatGPT — OpenAI | [chatgpt.com](https://chatgpt.com) | Gratuit / Pro |
| Claude — Anthropic | [claude.ai](https://claude.ai) | Raisonnement |
| Groq API — Llama 3 | [console.groq.com](https://console.groq.com) | API rapide |
| Ollama — LLM local | [ollama.com](https://ollama.com) | 🔒 Local |

**Outils pédagogiques :**

- [Les transformers expliqués](https://poloclub.github.io/transformer-explainer/) — visualisation interactive
- [Visualisation 3D interne d'un LLM](https://bbycroft.net/llm)
- [Cours pour lycéens sur l'IA](https://www.elementsofai.fr/) — Elements of AI
- [Common Crawl](https://commoncrawl.org/get-started) — Internet à télécharger
- [ConvNetJS](https://cs.stanford.edu/people/karpathy/convnetjs/) — visualiser l'apprentissage en temps réel
- [Quick, Draw!](https://quickdraw.withgoogle.com/) — comment une IA reconnaît des dessins

---

### 📚 Ressources Web

**Comprendre l'IA — francophones :**
- [Éduscol — Se former et enseigner avec l'IA](https://eduscol.education.fr/2285/se-former-et-enseigner-avec-lia) · Ministère
- [Pixees.fr](https://pixees.fr) — ressources NSI & IA officielles
- [FUN MOOC](https://www.fun-mooc.fr) — cours IA en français (gratuit)
- [CNRS Formation Fidle](https://www.youtube.com/c/CNRSFormationFIDLE) — vidéos en français

**Éthique & cadre légal :**
- [CNIL — IA & données personnelles](https://www.cnil.fr/fr/intelligence-artificielle)
- [Éduscol — Vademecum "IA et éducation"](https://eduscol.education.fr)
- [AI4K12](https://ai4k12.org) — 5 grands concepts IA (K-12)

---

## Licence & contact

Ce site est partagé librement dans un esprit de collaboration enseignante. Les ressources sont des **points de départ** — testez-les vous-même avant de les proposer aux élèves, et n'hésitez pas à les adapter.

🔗 [darksathili.kesug.com](https://darksathili.kesug.com) · [← Retour au site NSI](../index.html)
