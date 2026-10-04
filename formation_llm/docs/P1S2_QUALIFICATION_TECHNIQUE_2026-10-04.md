# P1S2 — Qualification technique V3

Date : 2026-10-04  
Branche : `refactor/latent-v3-p1s2-attention`  
Base : P1S1 qualifié `50eac087f334f0de28ae1fd9f5e1dae01cccb030`  
Run de qualification : `37217484719`  
Commit qualifié : `e6c3d149c3b981cbbe6554944def105da8a3c6da`

## Statut

**QUALIFIÉ TECHNIQUEMENT — DESIGN-READY**  
**NON NOVICE-READY — validation terrain toujours requise**

P2 reste gelé. P1S3 ne peut commencer qu'à partir de cette base qualifiée.

## Changement pédagogique majeur

L'ancienne séquence introduisait très tôt Q/K/V et la formule complète. La V3 inverse l'ordre :

1. constater le problème de contextualisation avec le mot ambigu « avocat » ;
2. prédire quels éléments du contexte sont utiles ;
3. seulement ensuite nommer Query, Key et Value ;
4. suivre un exemple travaillé ;
5. manipuler le calcul complet dans Attention Lab ;
6. expliciter les limites d'interprétation ;
7. récupération et transfert.

Le premier acte cognitif précède donc le jargon Q/K/V.

## Domaine pur

Le moteur `src/domain/activities/attention.mjs` possède notamment :

- `dotProduct()` ;
- `scaleAttentionScore()` ;
- `stableSoftmax()` ;
- `applyCausalMask()` ;
- `weightedSum()` ;
- `evaluateAttention()`.

Il ne dépend ni du DOM, ni d'Electron, ni du stockage.

Les tests couvrent :

- produit scalaire ;
- scaling `1/sqrt(dk)` ;
- somme du softmax = 1 ;
- invariance du softmax à un décalage constant ;
- masquage causal ;
- somme pondérée des Values ;
- attention complète ;
- erreurs de dimension.

## Contrat ECDL

`content/modules/p1s2.json` sépare :

- outcomes ;
- misconceptions ;
- evidence ;
- activités ;
- sections ;
- politique de maîtrise ;
- validation terrain.

Le statut reste `design-ready` et `fieldValidation.status` reste `pending`.

## Assessment

`content/assessment-banks/p1s2.json` contient :

- 6 questions de récupération ;
- 4 situations de transfert.

Les pièges explicitement testés incluent :

- embedding initial = sens contextuel complet ;
- Q/K/V comme objets linguistiques symboliques ;
- Q·K = probabilité ;
- position future accessible en génération causale ;
- poids d'attention = vérité ou explication complète.

## Attention Lab

L'adaptateur Web ne recalcule pas l'attention. Il délègue à `evaluateAttention()`.

Trois scénarios déterministes sont fournis :

- contexte juridique ;
- contexte alimentaire ;
- scénario causal où des Values futures volontairement fortes deviennent inaccessibles avec le masque.

L'apprenant peut agir sur :

- le scénario ;
- le masque causal ;
- le scaling.

L'interface expose :

- scores Q·K ;
- scores utilisés ;
- poids softmax ;
- positions masquées ;
- somme pondérée des Values ;
- limite d'interprétation des poids.

## Gate E2E

Le gate P1S2 est lancé depuis le **main Electron de production**, via `--latent-e2e-p1s2`.

Il vérifie pour Web et Electron :

- rendu depuis `p1s2.json` ;
- absence d'activité non supportée ;
- prédiction contextuelle ;
- masque causal : deux positions futures obtiennent réellement un poids nul ;
- retrait du masque : les positions futures retrouvent un poids non nul ;
- émission d'événements ;
- quiz + transfert ;
- persistance locale ;
- reprise de l'état de maîtrise après reload.

## Visual & Accessibility Gate

P1S2 possède un gate dédié.

Web :
- 1360×900 ;
- 390×844.

Electron :
- 1360×900.

Pour chaque viewport :
- sombre ;
- clair ;
- projection.

Invariants contrôlés :
- un seul `h1` et landmark `main` ;
- noms accessibles ;
- aucun tabindex positif ;
- navigation clavier ;
- focus visible ;
- cibles interactives >= 40 px ;
- absence de clipping majeur et d'overflow horizontal ;
- contraste >= 4,5:1 ;
- contraste projection >= 7:1 ;
- Attention Lab branché sur `attention-engine` ;
- quatre positions visibles ;
- deux positions futures masquées dans le scénario causal ;
- sortie vectorielle présente ;
- contrôles empilés sur mobile et non artificiellement empilés sur desktop.

## Preuve CI

Workflow : `Validate LATENT V3`  
Run : `37217484719`  
Conclusion : **SUCCESS**

Étapes vertes :

1. syntax-check V3 ;
2. domaine + contenu + architecture ;
3. baseline E2E P0/P1S1/Tokenizer ;
4. P1S2 Attention E2E Web/Electron ;
5. Visual & Accessibility Gate ;
6. publication des rapports.

Artefact : `latent-v3-visual-a11y-reports`  
Artifact ID : `11308138992`  
Digest : `sha256:60c268cd9df742172955b0f9c5234ee4b82253e07d3539a8ee9b6b622ef093e3`

## Ce que ce gate ne prouve pas

Cette qualification prouve la cohérence technique, architecturale et les invariants automatisables d'accessibilité/présentation.

Elle **ne prouve pas encore** que des élèves novices comprennent mieux l'attention. Le module reste donc `design-ready`.

Le passage à `pilot-ready`, puis éventuellement `novice-ready`, devra utiliser un test terrain mesurant notamment :

- capacité à expliquer pourquoi « avocat » change selon le contexte ;
- compréhension de Q/K/V sans métaphore magique ;
- prédiction correcte de l'effet du masque causal ;
- reconstruction de la chaîne Q·K → scaling → masque → softmax → somme des V ;
- capacité à dire pourquoi un poids d'attention élevé n'est pas une preuve de vérité.

## Décision

P1S2 peut servir de base à **P1S3 — Transformer Block Lab**.

P2 reste gelé jusqu'à qualification complète de P1S1 → P1S4.
