# P1S4 — Qualification technique LATENT V3

Date : 2026-10-04  
Branche : `refactor/latent-v3-p1s4-sampling`  
Commit qualifié : `f24b6a3e3e39ff7c50f61dbfb5f5a14113a13cb0`  
Workflow : `Validate LATENT V3` — run `37221535519` — **SUCCESS**

## Décision

P1S4 — **Sampling et décodage** est qualifié **techniquement** comme quatrième tranche de P1 sous l'architecture LATENT V3.

Cette qualification n'accorde pas le statut `novice-ready`. Le module reste `design-ready` et sa validation terrain reste `pending` tant qu'un test réel auprès d'apprenants novices n'a pas été réalisé et analysé.

P2 reste gelé. La fin technique de P1 autorise désormais un **P1 Integration Freeze + Learner Gate**, mais pas encore l'ouverture automatique de P2.

## Correction du défaut pédagogique V2

La V2 introduisait une série dense de notions — logits, distribution, greedy, sampling, température, top-k, top-p et autoregression — avant que l'apprenant ne puisse réellement manipuler le phénomène.

P1S4 V3 inverse cet ordre :

1. trois candidats seulement : `calcule`, `choisit`, `hésite` ;
2. trois scores simples : `[2, 1, 0]` ;
3. prédiction de la décision avec une règle explicite ;
4. observation d'un tirage pondéré ;
5. seulement ensuite introduction des mots `logit`, `softmax`, `greedy` et `sampling` ;
6. température ;
7. top-k / top-p ;
8. boucle autoregressive.

Le contrat fixe `firstMeaningfulActionTargetWords: 140` et impose quatre manipulations significatives reconnues par le Content Gate :

- prédiction sur trois candidats ;
- Sampling Lab ;
- Truth Trap ;
- Autoregressive Loop Lab.

## Moteur de domaine pur

`src/domain/activities/sampling.mjs` fournit notamment :

- `softmax()` ;
- `renormalize()` ;
- `topKMask()` ;
- `topPMask()` ;
- `filterDistribution()` ;
- `greedyIndex()` ;
- `sampleIndex()` ;
- `randomFromSeed()` ;
- `decodeStep()` ;
- `advanceAutoregressive()`.

Le moteur est indépendant du DOM, d'Electron, du stockage et du réseau.

Le renderer consomme les résultats du domaine mais ne réimplémente ni exponentielle, ni top-p cumulatif, ni tirage pseudo-aléatoire, ni boucle de décision.

## Invariants scientifiques explicitement protégés

Les tests verrouillent notamment les points suivants :

- `[2,1,0]` produit par softmax une distribution d'environ `[0,665 ; 0,245 ; 0,090]` à `T=1` ;
- une température inférieure à 1 concentre une distribution déjà orientée ;
- une température supérieure à 1 l'aplatit ;
- top-k conserve un nombre fixe de candidats ;
- top-p conserve le plus petit préfixe trié atteignant une masse cumulée cible ;
- le filtrage est suivi d'une renormalisation ;
- greedy est un argmax local déterministe ;
- sampling est un tirage pondéré et non uniforme ;
- la graine pédagogique produit des essais reproductibles ;
- un token sélectionné est ajouté au contexte et influence l'état de décodage suivant ;
- une faible température peut renforcer un candidat factuellement faux déjà dominant ;
- aucun résultat du moteur ne prétend vérifier la vérité.

Greedy est volontairement séparé de `T=0` : le moteur n'effectue jamais une division littérale par zéro dans `softmax(logits/T)`.

## Truth Trap

Le scénario de remédiation utilise volontairement :

- `affirmation fausse` : logit `3,2` ;
- `affirmation vraie` : logit `2` ;
- `je ne sais pas` : logit `1`.

L'apprenant peut diminuer la température et constater que la mauvaise option déjà dominante devient encore plus concentrée.

Le but est de verrouiller la distinction :

**confiance locale du décodeur ≠ factualité ≠ vérification externe**.

## Autoregressive Loop Lab

Le laboratoire ne simule pas une réponse entière en une seule décision. Il expose explicitement :

`contexte → logits → distribution → sélection → token ajouté → nouvel état → nouvelle distribution`

La simulation utilise un graphe déterministe de petits états pédagogiques afin que deux premiers choix différents puissent conduire à des distributions suivantes différentes sans prétendre reproduire tous les détails d'un LLM réel.

## Vérifications de domaine

La suite complète compte **69 tests unitaires/contrats**, tous réussis :

- 69 pass ;
- 0 fail ;
- 0 skipped ;
- 0 cancelled.

## Content & Architecture Gates

Les gates vérifient notamment :

- statut `design-ready` conservé ;
- validation terrain `pending` conservée ;
- quatre manipulations significatives minimales ;
- expérience initiale à trois candidats `[2,1,0]` conservée ;
- prédiction avant le jargon ;
- Truth Trap avec candidat faux dominant avant réglage de température ;
- moteur sampling pur ;
- renderer délégué au domaine ;
- absence de logique `softmax/top-p/random` recopiée dans le renderer ;
- positions des bonnes réponses variées dans la banque d'évaluation ;
- absence de style inline dans le renderer P1S4.

## Défaut CSP découvert pendant la qualification

Un premier workflow complet était vert alors que les logs Chromium signalaient que les barres de probabilités utilisaient des attributs `style="width:..."` interdits par la CSP `style-src 'self'`.

Ce défaut a été classé bloquant malgré le succès des tests fonctionnels : les pourcentages textuels étaient corrects mais la visualisation graphique pouvait être supprimée par Chromium.

La correction remplace les barres dynamiques par de vrais éléments HTML `<progress max="1" value="…">` et déplace toute leur présentation dans `sampling-labs.css`.

Le Visual Gate vérifie maintenant, dans chaque cellule de la matrice :

- trois barres réelles dans Sampling Lab ;
- trois barres réelles dans Truth Trap ;
- valeur positive et bornée ;
- `max=1` ;
- géométrie visible réelle ;
- aucune propriété `style` inline dans les activités P1S4.

Le gate d'architecture refuse également tout retour de style inline dans `sampling-renderer.mjs`.

Le run qualifiant ne contient plus l'erreur CSP liée à l'application de styles inline.

## Évaluation : suppression d'un biais de position

La première banque P1S4 plaçait toutes les bonnes réponses à l'index `0`. Ce défaut a été corrigé avant qualification finale.

Les réponses correctes occupent maintenant plusieurs positions dans le quiz et dans le transfert ; le gate P1S4 exige au moins trois positions distinctes sur l'ensemble de la banque.

## E2E Web + Electron

Le gate P1S4 ouvre le même contenu déclaratif dans les deux shells et vérifie notamment :

- rendu de `p1s4.json` ;
- six micro-séquences ;
- absence d'activité V3 non supportée ;
- prédiction initiale sur trois candidats ;
- greedy sur `[2,1,0]` ;
- distribution softmax attendue ;
- top-p `0,8` filtrant le troisième candidat à `T=1` dans ce scénario ;
- renforcement du candidat dominant à basse température ;
- sampling capable de produire un candidat non maximal avec une graine appropriée ;
- Truth Trap renforçant le candidat faux dominant sans prétendre le corriger ;
- boucle autoregressive qui enrichit le contexte et change l'état suivant ;
- événements d'apprentissage ;
- quiz + transfert ;
- persistance et reprise de l'état de maîtrise après rechargement.

Les gates historiques P0 + P1S1 + Tokenizer, P1S2 et P1S3 repassent dans le même workflow afin d'empêcher une régression transversale.

## Visual & Accessibility Gate

P1S4 est vérifié automatiquement dans la matrice suivante :

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
- contrastes contrôlés à 4,5:1, et 7:1 pour les couples testés en projection ;
- empilement mobile des contrôles Sampling et des candidats de la boucle ;
- trois candidats visibles ;
- filtrage top-p observable ;
- six barres de probabilité CSP-safe effectivement rendues ;
- Truth Trap présent ;
- contexte autoregressif enrichi ;
- aucune activité non supportée.

Le workflow final publie **54 rapports JSON Visual/A11y** couvrant l'ensemble des tranches exécutées dans la CI.

Artefact : `latent-v3-visual-a11y-reports`  
Artifact ID : `11310184716`  
Taille : `41214` octets  
SHA-256 : `1b16ed8450a6b71df0e77f9ebed01d97d37987a71c83acb60718529b37f08bc2`

## Limites explicitement non validées

Cette qualification ne prouve pas encore :

- que des élèves novices comprennent réellement mieux le décodage ;
- qu'ils distinguent spontanément confiance locale et vérité après délai ;
- qu'ils savent expliquer top-p sans l'interface ;
- qu'ils transfèrent le modèle mental à une distribution nouvelle ;
- que la charge cognitive est optimale en classe ;
- que le rendu a fait l'objet d'une inspection humaine exhaustive pixel par pixel sur tous les matériels réels.

Ces points relèvent du **Learner Gate**.

## Avertissements techniques non bloquants encore présents

Le run qualifiant reste vert mais conserve des dettes déjà identifiées :

- `frame-ancestors` est ignoré lorsqu'il est défini via une balise CSP `<meta>` ;
- l'API Electron `console-message` utilisée par les harness E2E est annoncée comme dépréciée ;
- plusieurs dépendances npm transitives sont dépréciées ;
- les GitHub Actions v4 signalent leur transition forcée de Node.js 20 vers Node.js 24 sur le runner.

Ces avertissements ne sont pas présentés comme résolus par P1S4.

## Gate de sortie P1S4

**PASS technique.**

P1 est désormais techniquement complet sous le patron V3 :

- P1S1 — Tokens / représentations / contexte : qualifié techniquement ;
- P1S2 — Attention : qualifié techniquement ;
- P1S3 — Bloc Transformer / position / KV cache : qualifié techniquement ;
- P1S4 — Sampling / décodage : qualifié techniquement.

La prochaine étape recommandée est un **P1 Integration Freeze + Learner Gate** avant toute migration de P2.
