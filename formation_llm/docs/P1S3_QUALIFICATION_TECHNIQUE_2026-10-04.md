# P1S3 — Qualification technique LATENT V3

Date : 2026-10-04  
Branche : `refactor/latent-v3-p1s3-transformer-block`  
Commit qualifié : `690c8bf9b0aa33ccd95edab93e930d18469cfb94`  
Workflow : `Validate LATENT V3` — run `37219157055` — **SUCCESS**

## Décision

P1S3 — **Transformer Block Lab** est qualifié **techniquement** comme troisième tranche de P1 sous l'architecture LATENT V3.

Cette qualification n'accorde pas le statut `novice-ready`. Le module reste `design-ready` et sa validation terrain reste `pending` tant qu'un test réel auprès d'apprenants novices n'a pas été réalisé et analysé.

P1S4 et P2 restent gelés pendant cette qualification ; P1S4 peut être ouvert uniquement après cette preuve technique P1S3.

## Périmètre qualifié

La migration ne reproduit pas la page V2 monolithique. Elle sépare trois responsabilités de domaine :

1. `transformer-block-engine` — architecture pré-norm didactique, normalisation, mise à jour d'attention, résidu, MLP et seconde mise à jour résiduelle ;
2. `position-engine` — absence de position, ajout absolu didactique et RoPE simplifié déterministe ;
3. `kv-cache-engine` — compromis entre recalcul et mémoire temporaire, sans assimilation à une mémoire utilisateur persistante.

Les trois moteurs sont indépendants du DOM, d'Electron, du stockage et du réseau. Le renderer Web consomme leurs résultats mais ne réimplémente pas leurs calculs.

## Contrat pédagogique ECDL

`content/modules/p1s3.json` définit quatre objectifs observables :

- distinguer attention, MLP, normalisation et connexion résiduelle ;
- comprendre comment l'ordre entre dans le calcul sans changer l'identité du token ;
- suivre une représentation dans une architecture pré-norm simplifiée ;
- distinguer KV cache, contexte, mémoire applicative et entraînement.

Les misconceptions, preuves attendues, tâches, critères de réussite, quiz et transferts sont reliés explicitement.

La première activité est une **prédiction de rôle** avant le schéma complet. Le module impose ensuite quatre manipulations significatives reconnues par le Content Gate :

1. prédiction des responsabilités ;
2. Position Lab ;
3. Block Lab ;
4. KV Cache Lab.

Le contrat fixe désormais `minimumMeaningfulManipulations: 4`. Toute régression qui ferait disparaître l'une de ces catégories de manipulation échouerait au Content Gate.

## Vérifications de domaine

La suite complète compte **58 tests unitaires/contrats**, tous réussis :

- 58 pass ;
- 0 fail ;
- 0 skipped ;
- 0 cancelled.

Les nouveaux invariants P1S3 couvrent notamment :

- addition résiduelle composante par composante ;
- RMS normalisé approximativement égal à 1 ;
- effet de l'activation/désactivation du résidu et du MLP ;
- conservation de la norme sous rotation RoPE simplifiée ;
- position zéro inchangée ;
- identité du token distincte de la représentation positionnée ;
- réutilisation des positions passées par le KV cache ;
- compromis calcul/mémoire ;
- `KV cache ≠ mémoire persistante` ;
- absence de modification des poids du modèle par le cache.

## Architecture Gate

Le gate P1S3 vérifie notamment :

- absence de `document`, `window`, `localStorage`, Electron, IPC et `fetch` dans les moteurs de domaine ;
- délégation explicite du renderer aux trois moteurs ;
- absence de duplication de `Math.tanh`, des rotations trigonométriques et de la normalisation dans le renderer ;
- présence des trois types de laboratoires dans le contrat ;
- statut `design-ready` conservé ;
- validation terrain `pending` conservée ;
- première action manipulation-first conservée.

## E2E Web + Electron

Le gate P1S3 ouvre le même contenu déclaratif dans les deux shells.

Il vérifie notamment :

- rendu de `p1s3.json` ;
- six micro-séquences ;
- présence des trois moteurs de domaine ;
- prédiction correcte des rôles Attention / MLP / Résiduel ;
- changement de représentation sous RoPE sans changement du token ID ;
- modification observable de la sortie du Block Lab lorsqu'on retire MLP puis résidu ;
- sept étapes visibles du bloc didactique ;
- scénario KV avec 12 positions passées : 13 positions à recalculer sans cache, 1 nouvelle position calculée avec cache, 12 recalculs évités, 24 vecteurs K/V conservés ;
- événements d'apprentissage ;
- quiz + transfert ;
- persistance et reprise de l'état de maîtrise après rechargement.

Les gates historiques P0 + P1S1 + Tokenizer et P1S2 repassent également dans le même workflow afin d'empêcher une régression transversale.

## Visual & Accessibility Gate

P1S3 est vérifié automatiquement dans la matrice suivante :

### Web

- 1360 × 900 — sombre, clair, projection ;
- 390 × 844 — sombre, clair, projection.

### Electron

- 1360 × 900 — sombre, clair, projection.

Les invariants incluent :

- un seul `h1` et présence du landmark `main` ;
- contrôles nommés et accessibles au clavier ;
- aucun `tabindex` positif ;
- focus visible ;
- cibles interactives d'au moins 40 px selon le gate ;
- absence de débordement horizontal ;
- contraste minimal 4,5:1, porté à 7:1 en projection pour les couples de couleurs contrôlés ;
- empilement mobile des grilles Position, Block et KV ;
- représentation positionnée présente ;
- sept états du Block Lab ;
- quatre métriques du KV Cache Lab ;
- aucune activité V3 non supportée affichée.

Le workflow final publie **45 rapports JSON Visual/A11y** couvrant l'ensemble des tranches exécutées dans la CI.

Artefact : `latent-v3-visual-a11y-reports`  
Artifact ID : `11309726533`  
Taille : `32012` octets  
SHA-256 : `9fe030e8e09502aeaa378d5c15582e0f1846a5f9f4430fe0161e8e2610b12ae9`

## Limites explicitement non validées

Cette qualification ne prouve pas encore :

- que des élèves novices comprennent effectivement plus vite P1S3 ;
- qu'ils savent expliquer le bloc sans l'écran ;
- qu'ils transfèrent le modèle mental à une architecture ou une situation nouvelle ;
- que la charge cognitive est optimale en classe ;
- que le rendu a fait l'objet d'une inspection humaine exhaustive pixel par pixel sur tous les matériels réels.

Ces éléments relèvent du **Learner Gate** et d'une observation terrain. Ils conditionnent tout passage futur de `design-ready` vers `pilot-ready`, puis éventuellement `novice-ready`.

## Avertissements techniques non bloquants observés en CI

Le run reste vert mais signale des avertissements à traiter séparément :

- `frame-ancestors` est ignoré lorsqu'il est défini via une balise CSP `<meta>` ;
- l'API Electron `console-message` utilisée par le harness est annoncée comme dépréciée ;
- plusieurs dépendances npm transitives sont dépréciées ;
- les actions GitHub v4 signalent leur transition forcée de Node.js 20 vers Node.js 24 sur le runner.

Aucun de ces avertissements ne doit être présenté comme corrigé par cette qualification.

## Gate de sortie P1S3

**PASS technique.**

La prochaine tranche autorisée est **P1S4 — Sampling / décodage**, en conservant les mêmes règles : contenu déclaratif, moteur de domaine pur, manipulation avant accumulation de vocabulaire, E2E Web/Electron et Visual/A11y. P2 reste gelé jusqu'à qualification complète de P1.
