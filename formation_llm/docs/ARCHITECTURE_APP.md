# Architecture applicative — Formation LLM

## Objectif

`formation_llm/` devient progressivement l'application de référence pour la refonte de la formation LLM. Le répertoire historique `formation_ia/` reste inchangé jusqu'à validation complète de la migration.

## Principe à deux couches

1. Référentiel interne : domaines A, B, C… avec concepts, prérequis, termes, erreurs fréquentes, questions difficiles et sources.
2. Parcours stagiaire : niveaux 0 à 7 organisés par compétences et usages.

## Règle de nomenclature visible

L'interface stagiaire n'affiche **que les parcours 0 à 7**. Les domaines A/B/C… et identifiants A01/B01/C01… sont réservés au référentiel interne, aux données et aux outils de validation. Un stagiaire ne doit jamais avoir à comprendre deux systèmes de numérotation concurrents.

Correspondance actuelle :
- Parcours 0 — Fondamentaux ← référentiel interne A ;
- Parcours 1 — Comprendre un LLM ← référentiels internes B, C et futurs blocs génération/entraînement utiles ;
- Parcours 4 — Recherche & RAG ← concepts retrieval/RAG du référentiel interne.

## Parcours cible

- 0 — Fondamentaux
- 1 — Comprendre un LLM
- 2 — Dialoguer efficacement
- 3 — Fiabilité & évaluation
- 4 — Recherche & RAG
- 5 — Outils & agents
- 6 — IA & pédagogie
- 7 — Sous le capot

## Laboratoires

Déjà actifs : Tokenizer Lab, Embedding Lab, Context Lab, Attention Lab.

À construire : Sampling Lab, Hallucination Lab, Chunking/Retrieval/Reranking Lab, Agent Lab.

## Progression

La V0.1 utilise localStorage pour mémoriser le dernier module ouvert, la validation manuelle B/C et le thème. À terme, les quiz et preuves de maîtrise devront alimenter cet état automatiquement.

## Modes

- Stagiaire : navigation, labs, progression.
- Formateur : objectifs, questions, erreurs attendues, démonstrations, débrief.
- Projection : typographie et largeur adaptées à la salle.

## Contraintes

- GitHub Pages statique.
- Aucun secret côté client.
- Modules autonomes quand cela est pédagogiquement possible.
- Accessibilité clavier, responsive et prefers-reduced-motion.
- Ancienne formation conservée jusqu'à bascule contrôlée.
- CI obligatoire pour données et modules web.

## Migration

Aucun remplacement global de `formation_ia/` avant couverture fonctionnelle suffisante, audit pédagogique, tests de projection/mobile, vérification de la progression et validation GitHub Pages.