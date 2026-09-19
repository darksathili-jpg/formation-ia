# Formation LLM

Plateforme de formation professionnelle consacrée aux modèles de langage, construite comme un référentiel pédagogique vérifiable et une collection de modules interactifs autonomes.

## Application shell

`index.html` est désormais le point d'entrée de la nouvelle application : tableau de bord, parcours 0→7, laboratoires, progression locale, mode stagiaire, mode formateur et mode projection. Le shell reste autonome, sans API ni dépendance réseau, et l'ancienne `formation_ia/` n'est pas modifiée.

Architecture : [`docs/ARCHITECTURE_APP.md`](docs/ARCHITECTURE_APP.md).

## Module interactif — Domaine A

Le module [`modules/domaine-a.html`](modules/domaine-a.html) devient l'entrée pédagogique du parcours. Il couvre **A01 à A12 — Situer les LLM** avec :
- une carte conceptuelle IA → machine learning → deep learning → modèles de langage → LLM ;
- un constructeur interactif distinguant modèle, chatbot et application ;
- un exercice de classement d'objets et systèmes ;
- un atelier sur open weights, open source et modèles propriétaires ;
- un test de maîtrise ;
- les modes clair/sombre, formateur et projection.

La catégorie **GPAI** y est explicitement présentée comme une catégorie juridique européenne et non comme une taxonomie scientifique universelle.

## Module interactif — Domaine B

Le premier module exploitable est disponible dans [`modules/domaine-b.html`](modules/domaine-b.html), avec une page d'entrée dans [`index.html`](index.html).

Il couvre le Domaine B — **Tokens, représentations et contexte** — de B01 à B12 et comprend notamment :

- une chaîne visuelle `texte → tokens → IDs → embeddings → contexte` ;
- un **Tokenizer Lab** avec plusieurs modes de segmentation et un budget de contexte réglable ;
- des IDs et vecteurs **simulés à des fins pédagogiques**, explicitement distingués des tokenizers et poids de modèles commerciaux ;
- un laboratoire d'embeddings et de similarité cosinus ;
- un laboratoire de fenêtre de contexte distinguant contexte courant, mémoire applicative et paramètres du modèle ;
- un mode sombre/clair, un mode projection et un mode formateur ;
- un quiz de maîtrise formateur ;
- un fonctionnement autonome sans API ni dépendance réseau.

## Module interactif — Domaine C

Le module [`modules/domaine-c.html`](modules/domaine-c.html) introduit **Transformer et attention** de C01 à C09. Il comprend un **Attention Lab** local qui rend visible la chaîne `Q·K → /√dₖ → masque causal → softmax → Σ poids·V`, une matrice d’attention complète, trois têtes simulées, un mode formateur et un quiz. Les vecteurs sont fictifs et déterministes : ils illustrent les opérations sans prétendre reproduire un modèle commercial.

## Transformer Block Lab

Le laboratoire [`modules/transformer-block-lab.html`](modules/transformer-block-lab.html) constitue l'étape 3 du **Parcours 1 — Comprendre un LLM**. Il complète l'Attention Lab avec :
- un Position Lab distinguant absence de position, ajout positionnel didactique et RoPE simplifié ;
- une visualisation pré-norm d'un bloc avec normalisation, attention, résiduels et MLP ;
- une distinction explicite « attention = communiquer / MLP = transformer » ;
- un Stack Lab montrant la transformation progressive des représentations ;
- un KV Cache Lab illustrant le compromis calcul / mémoire ;
- un quiz de maîtrise et les modes stagiaire, formateur et projection.

Le laboratoire précise que l'ordre exact des opérations et les variantes de normalisation, position et MLP dépendent de l'architecture réelle.

## RAG Lab

Le laboratoire [`modules/rag-lab.html`](modules/rag-lab.html) isole le **retrieval** du reste du système RAG. Il contient un corpus contrôlé de 12 chunks et 6 questions avec vérité terrain graduée.

Le stagiaire peut comparer :
- recherche lexicale BM25 ;
- recherche vectorielle didactique par cosinus ;
- ANN approximatif simulé avec nombre de candidats réglable ;
- recherche hybride par Reciprocal Rank Fusion ;
- reranking optionnel des candidats ;
- calcul réel de Precision@k, Recall@k, Reciprocal Rank, MRR sur le corpus et nDCG@k.

Les embeddings, l'ANN et le reranker sont explicitement des modèles didactiques déterministes ; les métriques et formules sont réellement calculées dans le navigateur. Aucun appel réseau n'est effectué.

## Validation

Depuis `formation_llm/` :

```bash
npm ci
npm run validate
```

La commande exécute deux contrôles :

- `validate:data` : schémas JSON et intégrité référentielle du corpus pédagogique ;
- `validate:web` : contrôle structurel de l'application, des modules A/B/C et du RAG Lab, unicité des identifiants HTML, syntaxe JavaScript, absence de dépendances réseau et présence des éléments pédagogiques obligatoires.

Le workflow GitHub Actions `Validate Formation LLM` exécute cette validation à chaque modification pertinente.

## Contrat de données v1.1

Le référentiel sépare désormais :

- la stabilité temporelle d'une notion (`stability`) de son statut épistémique (`epistemic_status`) ;
- le rôle probant d'une source (`evidence_role`) de la nature de son éditeur (`publisher_kind`) ;
- la carte pédagogique des concepts du glossaire terminologique, reliés par `term_ids`.

Les idées fausses comportent une correction explicite et les questions difficiles du formateur comportent des points de réponse attendus. Le validateur contrôle en plus l'intégrité référentielle, les doublons et les cycles de prérequis.
