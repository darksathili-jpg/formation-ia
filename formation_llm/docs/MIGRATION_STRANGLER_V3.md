# Migration LATENT V3 — Strangler Fig

Date : 2026-10-02

## Principe

`formation_llm/` reste en production pendant que `latent_app/` se construit à côté. Les fonctionnalités ne migrent que lorsqu'une tranche V3 dépasse objectivement la version legacy sur les critères ciblés.

Aucune bascule globale ne sera faite sur la base d'une impression visuelle.

## Phase 0 — Architecture sandbox

Livrables :

- architecture ECDL + hexagonale documentée ;
- Electron sécurisé ;
- renderer Web commun ;
- ports ;
- domaine de maîtrise ;
- modèle d'événement ;
- schéma de module ;
- contenu P0 déclaratif ;
- tests et CI V3.

Gate : la sandbox se lance, fonctionne sans réseau et le domaine passe ses tests.

## Phase 1 — Vertical slice P0

### À migrer

- premier défi ;
- modèle/application ;
- System Builder ;
- Family Lab ;
- auto-explication ;
- quiz ;
- transfert ;
- mode formateur ;
- projection ;
- progression ;
- événements.

### Gate technique

- même contenu sur Web et Electron ;
- aucune règle métier dépendante du DOM ;
- reprise de session ;
- import de l'état legacy ;
- accessibilité clavier ;
- rendu 1366×768, mobile et projection ;
- absence de dépendance réseau.

### Gate pédagogique

P0 reste `pilot-ready` jusqu'au retest terrain. Les événements locaux doivent permettre de mesurer :

- temps avant première action ;
- nombre de tentatives ;
- demandes d'aide/hints ;
- corrections après feedback ;
- quiz ;
- transfert.

## Phase 2 — Vertical slice Tokenizer Lab

Objectif : tester l'architecture sur un lab avec moteur scientifique.

### Séparation attendue

```text
tokenizer-domain.mjs
  input -> segmentation model -> observable state

TokenizerLab UI
  commands -> domain -> render
```

Le moteur ne doit pas manipuler directement le DOM.

### Tests obligatoires

- `extraordinaire` ne retombe pas caractère par caractère dans le modèle BPE didactique ;
- espaces, accents, emojis, ponctuation ;
- budget de contexte ;
- passage d'un mode didactique à un autre ;
- cohérence des explications ;
- responsive/projection.

## Phase 3 — Learner Engine V3

- IndexedDB adapter ;
- import legacy ;
- event store local ;
- review queue ;
- misconceptions ;
- dashboard ;
- export/import du profil.

Gate : fermer/réouvrir l'app ne perd aucune preuve et une migration peut être rejouée sans doublons.

## Phase 4 — Requalification pédagogique

Les modules legacy actuellement `novice-ready` sont réexaminés un par un selon le standard V2/V3.

Statut cible avant retest : `pilot-ready`.

Ordre proposé :

1. P1 Tokens/Embeddings/Contexte ;
2. P1 Attention ;
3. Transformer Block ;
4. Sampling ;
5. Dialoguer efficacement ;
6. Fiabilité ;
7. RAG.

## Phase 5 — Parcours manquants et benchmark FIDLE

Après stabilisation du moteur :

- méthodologie ML ;
- données ;
- entraînement ;
- failure-first ;
- robustesse ;
- inference/deployment ;
- multimodal ;
- enjeux sociétaux/éthiques ;
- outils/agents ;
- IA & pédagogie.

## Phase 6 — Distribution

### Windows priorité 1

- package Electron ;
- installateur ;
- version portable si utile ;
- signature de code à préparer pour une distribution large ;
- tests sur postes établissement.

### Web

- build statique ;
- PWA/offline à terme ;
- aucune divergence de contenu avec desktop.

## Gates de remplacement

Une page legacy peut être retirée seulement si la tranche V3 correspondante :

- couvre ses outcomes ;
- ne régresse pas les labs ;
- passe les tests ;
- passe l'audit visuel ;
- fonctionne Web + Electron ;
- migre l'état utilisateur ;
- possède un statut pédagogique honnête.

## Mesures de réussite de la refonte

### Technique

- diminution forte du code shell dupliqué ;
- correction transverse en un seul endroit ;
- couverture du domaine par tests ;
- temps de démarrage acceptable ;
- zéro dépendance réseau obligatoire.

### Pédagogique

- première action plus précoce ;
- réduction des aides professorales ;
- meilleures explications sans écran ;
- amélioration du transfert ;
- feedback considéré comme utile par les apprenants ;
- réactivation réellement effectuée.

### Produit

- installation simple ;
- reprise de session fiable ;
- export/import transparent ;
- mode formateur exploitable ;
- mise à jour sans casser les preuves d'apprentissage.
