# P1 Integration Freeze + Learner Gate — LATENT V3

Date : 2026-10-05  
Branche : `refactor/latent-v3-p1-integration-freeze`  
Commit technique qualifié : `63f02bb1a2d7fbc446f98227e12408702f8c1e5b`  
Workflow de qualification technique : `Validate LATENT V3` — run `37262445818` — **SUCCESS**

## Décision

Le parcours intégré **P0 → P1S1 → P1S2 → P1S3 → P1S4** est désormais **gelé techniquement** comme référence LATENT V3 pour le premier parcours complet.

Ce gel signifie :

- l'ordre du parcours est fixe ;
- les contrats pédagogiques JSON et les banques d'évaluation sont protégés par leur Git blob SHA ;
- toute modification d'un de ces contrats invalide le gate de gel jusqu'à requalification explicite ;
- **P2 reste verrouillé** ;
- le succès des tests logiciels ne confère pas le statut `novice-ready` ;
- aucune ouverture de P2 ne peut être déclenchée automatiquement par une métrique ;
- une décision humaine explicite reste obligatoire après analyse du Learner Gate.

## Parcours gelé

1. `p0` — Comprendre ce qui se cache derrière un assistant IA ;
2. `p1s1` — Tokens, représentations et contexte ;
3. `p1s2` — Transformer et attention ;
4. `p1s3` — Transformer Block Lab ;
5. `p1s4` — Sampling et décodage.

Le shell V3 affiche cette chaîne comme navigation de parcours, conserve la navigation interne propre à chaque module, indique l'état de maîtrise de chaque tranche et fournit une navigation séquentielle précédent/suivant. À la fin de P1S4, la sortie conduit au **Learner Gate**, pas à P2.

## Pourquoi un Learner Gate

Les validations automatisées peuvent démontrer que :

- le domaine est indépendant du DOM et d'Electron ;
- les calculs pédagogiques sont déterministes et testés ;
- le contenu respecte les contrats ECDL ;
- les pages fonctionnent en Web et Electron ;
- les modes sombre, clair et projection respectent les invariants visuels/accessibilité ;
- la progression et les traces sont persistées par des ports.

Elles ne peuvent pas démontrer qu'un élève novice **comprend**, **explique causalement** ou **transfère** ce qu'il vient de manipuler.

Le Learner Gate complète donc la télémétrie pédagogique locale par une observation humaine minimale.

## Politique de confidentialité

Le Learner Gate est **privacy-first et local-first**.

Règles obligatoires :

- ne saisir **aucun nom, prénom, adresse, identifiant scolaire ou autre donnée directement identifiante** ;
- chaque poste utilise un code pseudonyme local de la forme `P-XXXXXXXX` ;
- les traces et observations restent dans le navigateur / l'application locale ;
- aucun paquet n'est transmis automatiquement ;
- l'export JSON est déclenché uniquement par une action explicite de l'utilisateur ;
- l'analyse de cohorte se fait localement en important les paquets JSON exportés ;
- les notes libres doivent rester factuelles et ne contenir aucune donnée personnelle.

## Ce qui est mesuré automatiquement

Pour chaque module, le paquet terrain contient notamment :

- ouverture du module ;
- temps jusqu'à la première action cognitive significative ;
- nombre de prédictions, manipulations et tentatives ;
- score quiz ;
- score transfert ;
- état de maîtrise ;
- complétion du parcours.

Les actions significatives incluent notamment :

`prediction.submitted` · `manipulation.changed` · `attempt.completed` · `tokenizer.snapshot` · `explanation.self_checked`.

Le passage d'un module au suivant est également tracé par `course.navigation`.

## Ce qui exige une observation humaine

Pour chacun des cinq modules, l'observateur renseigne :

1. **aide conceptuelle directe avant la première manipulation** : oui / non ;
2. **explication sans écran**, score 0–2 :
   - `0` : ne peut pas expliquer le mécanisme ;
   - `1` : explication partielle ou sans relation causale claire ;
   - `2` : explication causale correcte avec au moins une limite ou distinction importante ;
3. **transfert différé réussi**, évalué entre 24 h et 7 jours ;
4. **misconception critique encore présente** : oui / non ;
5. **blocage maximal** : aucun / mineur / majeur ;
6. note factuelle optionnelle, sans donnée personnelle.

Une clarification de vocabulaire ou de consigne est autorisée. Toute aide qui fournit directement l'explication conceptuelle avant la première manipulation doit être comptée comme aide directe.

## Taille de cohorte

- minimum pour prendre une décision : **8 apprenants** ;
- taille recommandée : **10 apprenants** ;
- public : novices ou apprenants connaissant les usages des IA mais peu familiers avec le fonctionnement interne des LLM.

Le parcours peut être réparti sur plusieurs séances. Il n'est pas nécessaire de faire P0→P1S4 en une seule séance.

## Seuils du Learner Gate

| Indicateur | Seuil |
|---|---:|
| Participants minimum | 8 |
| Parcours complet | ≥ 75 % |
| Complétion de chaque module | ≥ 75 % |
| Temps médian avant première action significative | ≤ 180 s |
| Aide conceptuelle directe avant première action | ≤ 25 % |
| Score quiz médian | ≥ 75 % |
| Score transfert médian | ≥ 70 % |
| Taux de maîtrise | ≥ 65 % |
| Explication médiane sans écran | ≥ 1,5 / 2 |
| Transfert différé réussi | ≥ 70 % |
| Misconception critique persistante | ≤ 25 % |
| Blocage majeur | 0 |

Ces seuils sont des **guardrails de conception du produit**, pas des lois universelles d'apprentissage.

## États de sortie

Le moteur du Learner Gate ne possède que trois décisions :

### `pending-field-evidence`

La cohorte est trop petite ou certaines preuves importantes manquent. Il faut poursuivre le test terrain.

### `revise-before-p2`

La quantité de données est suffisante mais au moins un seuil n'est pas atteint. P1 doit être corrigé puis retesté avant d'ouvrir P2.

### `eligible-for-human-approval`

Tous les seuils sont satisfaits. Cela **n'ouvre pas P2**. Cela signifie seulement que le parcours est éligible à une revue humaine finale.

Invariant logiciel : `p2Unlocked = false` dans le moteur d'évaluation du Learner Gate.

## Protocole de test terrain

### Avant la première séance

1. sélectionner idéalement 8 à 10 élèves ;
2. ne pas effectuer de cours magistral donnant l'explication du mécanisme avant la première manipulation ;
3. chaque élève utilise son propre navigateur/profil local ou sa propre instance de l'application ;
4. vérifier que le code pseudonyme `P-…` est visible dans le Learner Gate ;
5. rappeler à l'observateur de ne jamais saisir l'identité de l'élève.

### Pendant chaque module

1. laisser l'élève découvrir la consigne ;
2. ne clarifier que la formulation si nécessaire ;
3. noter toute aide conceptuelle directe avant la première manipulation ;
4. laisser les traces automatiques mesurer le temps avant première action, les essais, quiz, transfert et maîtrise ;
5. à la fin du module, demander à l'élève de **fermer/masquer l'écran** et d'expliquer avec ses mots le mécanisme principal ;
6. attribuer 0, 1 ou 2 selon la grille ;
7. noter si une misconception critique reste présente ;
8. noter le blocage maximal observé.

### Transfert différé

Entre 24 heures et 7 jours après le module :

1. proposer un cas nouveau qui n'est pas une simple répétition de l'exemple d'entraînement ;
2. ne pas rappeler la solution ;
3. renseigner `transfert différé réussi : oui/non`.

### Fin de parcours

Sur chaque poste :

1. ouvrir **P1 Learner Gate** ;
2. vérifier que les cinq fiches d'observation sont complétées ;
3. cliquer sur **Exporter le paquet terrain** ;
4. récupérer le fichier `latent-p1-P-XXXXXXXX.json`.

Sur le poste enseignant / observateur :

1. ouvrir le Learner Gate ;
2. importer simultanément les paquets JSON ;
3. lire la décision de cohorte ;
4. examiner les métriques par module et les seuils en échec ;
5. si la décision est `revise-before-p2`, corriger les causes observées puis refaire une passe terrain ;
6. si la décision est `eligible-for-human-approval`, effectuer une revue humaine explicite avant toute décision d'ouverture de P2.

## Preuves techniques de la qualification

Run qualifiant : `37262445818` sur le commit `63f02bb1a2d7fbc446f98227e12408702f8c1e5b`.

Résultats :

- **76 tests / 76 réussis / 0 échec** ;
- contenu LATENT V3 valide ;
- architecture V3 valide ;
- P1S2 valide ;
- P1S3 valide ;
- P1S4 valide ;
- P1 Integration Freeze valide ;
- baseline P0 + P1S1 + Tokenizer Web/Electron + Visual/A11y valide ;
- P1S2 Web/Electron + Visual/A11y valide ;
- P1S3 Web/Electron + Visual/A11y valide ;
- P1S4 Web/Electron + Visual/A11y valide ;
- parcours intégré P0→P1S4 validé séquentiellement en Web et Electron ;
- Learner Gate validé en Web et Electron ;
- Learner Gate Visual/A11y :
  - Web desktop : sombre / clair / projection ;
  - Web mobile 390×844 : sombre / clair / projection ;
  - Electron desktop : sombre / clair / projection.

Le run publie **63 rapports JSON Visual/A11y**.

Artefact : `11325442027`  
Taille : `47 886` octets  
SHA-256 : `0abbc8604c3036ac94da93601a03eb2875aff3d3c23f7b392a3a14cb6c4863bc`

## Défauts découverts par le gate d'intégration

Le gate a déjà empêché plusieurs faux positifs :

- le lien Learner Gate ne respectait initialement pas la cible tactile minimale ;
- le nouvel événement `course.navigation` n'était pas encore autorisé par le contrat d'événements ;
- le Learner Gate produisait un débordement horizontal de 24 px en mobile 390 px + mode projection.

Ces défauts ont été corrigés à leur cause puis protégés par tests/gates.

## État réel après ce jalon

**Techniquement : P1 est qualifié comme parcours intégré et gelé.**

**Pédagogiquement : la validation terrain est encore à faire.**

Aucun module ne doit être promu `novice-ready` sur la seule base des tests automatisés. Le prochain jalon n'est donc pas P2 : c'est l'exécution du test terrain avec de vrais apprenants, l'import des paquets anonymisés/pseudonymisés et l'analyse humaine de la décision du Learner Gate.
