# Benchmark FIDLE → LATENT

Date : 2026-10-02  
Source principale : https://fidle.cnrs.fr/w3/

## Objet

FIDLE (CNRS / partenaires universitaires) constitue une référence francophone particulièrement utile pour vérifier la **couverture scientifique** et la **progression de profondeur** de LATENT.

L'objectif n'est pas de reproduire FIDLE. LATENT vise une expérience différente : application interactive autonome, adaptation locale, preuves de maîtrise, labs courts et manipulation-first. Le benchmark sert à détecter nos angles morts.

## 1. Ce que FIDLE fait structurellement bien

### Entrée sans prérequis

Le parcours « Bases, Concepts et Enjeux » annonce explicitement :

- public très large ;
- aucun prérequis ;
- 4 séquences ;
- environ 10 heures ;
- objectifs conceptuels, historiques, sociétaux, éthiques et technologiques.

Conséquence LATENT : Parcours 0 doit rester réellement accessible sans Python, mathématiques avancées ou jargon préalable.

### Progression par profondeur

Le programme FIDLE distingue plusieurs niveaux d'engagement :

1. bases / concepts / enjeux ;
2. IA comme outil avec pratique ;
3. acteur de l'IA, niveau avancé.

Conséquence LATENT : introduire trois tracks de lecture du même référentiel : `discover`, `practice`, `deepen`.

### Théorie + travaux pratiques

FIDLE associe supports, illustrations, notebooks/Docker, live et replay.

Conséquence LATENT : chaque notion importante doit proposer au moins une forme d'action ou de mise à l'épreuve. L'autonomie desktop permet d'aller plus loin en intégrant directement la manipulation.

### Place des embeddings

FIDLE traite explicitement :

- limites du one-hot ;
- embeddings ;
- usages ;
- séquences/RNN ;
- transition vers Transformers.

Conséquence LATENT : ne pas réduire les embeddings à « des vecteurs similaires ». Construire une progression concret → géométrie → usage → limite.

### Transformers

FIDLE aborde :

- attention ;
- multi-head attention ;
- autoregressif / auto-encoding / encoder-decoder ;
- préentraînement BERT/GPT ;
- fine-tuning ;
- usages hors langage.

Conséquence LATENT : le Parcours 1 actuel couvre bien attention/bloc/sampling, mais doit rendre plus explicites les **familles d'objectifs d'entraînement** et la différence architecture / objectif / usage.

### Méthodologie IA

FIDLE traite la méthodologie comme une compétence :

- préparation des données ;
- conception ;
- fonction de coût ;
- optimisation ;
- rétropropagation ;
- régularisation ;
- hyperparamètres ;
- évaluation ;
- robustesse ;
- modèles préentraînés ;
- bonnes pratiques.

Conséquence LATENT : la méthodologie ne doit pas être dispersée uniquement dans les labs. Elle mérite un parcours ou une colonne de compétences transverse.

### « Deep Failed »

FIDLE donne une place explicite aux approches qui ne fonctionnent pas ou mal.

Conséquence LATENT : créer une famille d'activités **failure-first** :

- modèle qui surapprend ;
- embeddings trompeurs ;
- tokenizer pathologique ;
- retrieval hors sujet ;
- grader mal spécifié ;
- prompt qui améliore une moyenne et crée une régression ;
- métrique qui masque un échec critique.

Ce type d'activité est particulièrement compatible avec le microcycle manipulation-first.

### Inférence / déploiement

FIDLE aborde aussi accélération, inférence et déploiement.

Conséquence LATENT : le niveau `deepen` doit aller jusqu'aux contraintes réelles : taille, mémoire, latence, quantification, contexte, coûts et compromis de déploiement.

## 2. Matrice de couverture LATENT actuelle

| Domaine | LATENT actuel | Dette | Action V3 |
| --- | --- | --- | --- |
| Bases IA / DL | P0 partiel | histoire/enjeux peu structurés | track Discover + cas concrets |
| Tokenisation | fort | simulation encore locale | moteur V3 + comparaisons réelles documentées |
| Embeddings | moyen/fort | manque de progression géométrique longue | lab 2D/3D + contre-exemples |
| Attention | fort | charge cognitive à revalider terrain | microcycles V3 |
| Transformer | fort | objectifs d'entraînement insuffisants | architecture vs prétraining vs fine-tuning |
| Sampling | fort | à tester terrain | migration V3 ultérieure |
| Prompting | fort | plusieurs modules non revalidés V2 | repasser pilot-ready |
| Fiabilité | fort | calibration P3S4 manquante | construire après refonte architecture |
| RAG | fort | très dense | parcours Discover/Practice différenciés |
| Méthodologie ML | faible/dispersé | dette forte | nouveau domaine transverse |
| Données | faible | dette forte | dataset, biais, split, fuite, qualité |
| Entraînement | faible | dette forte | backprop, loss, optimisation en approfondissement |
| Robustesse | moyen | dispersé | cas failure-first |
| Déploiement | faible | dette forte | inference/deployment dans Deepen |
| Enjeux sociétaux/éthiques | faible | dette forte | décisions situées, pas chapitre moral isolé |
| Multimodal | faible | dette | track Practice/Deepen |
| Agents/outils | prévu | non construit | bounded context futur |

## 3. Ce que LATENT peut faire mieux

FIDLE est une formation ouverte riche en supports et pratiques. LATENT peut viser une autre excellence :

### Manipulation immédiatement intégrée

Pas de notebook à lancer pour les premières notions : les phénomènes doivent être manipulables dans l'application.

### Adaptation locale transparente

L'apprenant voit :

- ce qu'il maîtrise ;
- ce qu'il doit retravailler ;
- pourquoi une activité est proposée ;
- quelles preuves ont conduit au statut.

### Feedback causale

Chaque erreur importante produit un diagnostic de modèle mental et une action suivante.

### Reprise dans le temps

Réactivation espacée et entrelacée intégrée à l'application.

### Mode formateur

Chaque activité expose erreurs attendues, relances et éléments de débrief.

### Offline réel

Le cours, les labs et l'état restent utilisables sans connexion.

## 4. Curriculum V3 proposé

### Track Discover — comprendre sans prérequis

- système IA, modèle et application ;
- données et apprentissage ;
- tokens / représentations / contexte ;
- attention / Transformer ;
- génération ;
- hallucination / preuve ;
- enjeux et limites ;
- mini-projet de synthèse.

### Track Practice — utiliser et évaluer

- prompting ;
- évaluation systématique ;
- recherche/RAG ;
- outils ;
- workflows ;
- conception pédagogique ;
- analyse de risques ;
- mini-projets authentiques.

### Track Deepen — sous le capot

- mathématiques utiles ;
- loss/optimisation/backprop ;
- embeddings avancés ;
- architectures et objectifs d'entraînement ;
- fine-tuning ;
- robustesse ;
- quantification/inférence ;
- déploiement ;
- multimodal ;
- lecture d'articles et reproduction simplifiée.

## 5. Règle de benchmark

Aucune notion n'est ajoutée simplement parce qu'elle existe chez FIDLE. Elle entre dans LATENT si :

1. elle sert un outcome explicite ;
2. une preuve d'apprentissage peut être définie ;
3. une activité adaptée au niveau peut l'enseigner ;
4. elle ne surcharge pas le parcours Discover ;
5. sa source scientifique est traçable.

FIDLE est un **benchmark de couverture et de progression**, pas la spécification du produit.
