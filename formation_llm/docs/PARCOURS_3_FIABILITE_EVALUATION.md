# Parcours 3 — Fiabilité & évaluation

Version : 1.2  
Date : 2026-09-22  
Statut : architecture de référence · P3S1, P3S2 et P3S3 actifs

## Principe de découpage

Le Parcours 3 suit une règle simple : **une étape = une décision cognitive principale**.  
Les notions proches ne sont pas empilées dans un même module si elles demandent des méthodes d'apprentissage différentes.

La progression retenue est :

`P1 Sampling → P3S1 → P3S2 → P3S3 → P3S4`

Le Parcours 4 — RAG reste un parcours distinct. Il pourra réutiliser les réflexes de P3S2 sans absorber le Parcours 3.

## P3S1 — Hallucinations & abstention

**Question directrice :** « Que puis-je réellement accepter dans cette réponse, et quand dois-je arrêter de conclure ? »

### Concepts centraux
- fluidité ≠ factualité ;
- claim / affirmation factuelle ;
- prémisse fausse ;
- claim confirmé ;
- claim contredit ;
- claim insuffisamment étayé ;
- réponse limitée ;
- clarification ;
- abstention.

### Compétence de sortie
L'apprenant sait diagnostiquer une sortie sans confondre précision verbale et vérité, puis refuser d'inventer lorsque les éléments disponibles ne suffisent pas.

### Hors périmètre
- méthode complète de recherche et qualification des sources ;
- provenance, triangulation et qualité documentaire ;
- construction d'un benchmark ou d'une suite d'évaluation ;
- calibration statistique, diagrammes de fiabilité, ECE ;
- arbitrage risque/couverture.

Le fichier actuel reste `modules/hallucination-lab.html` et l'identifiant interne `HALL` est conservé pour ne pas casser la progression déjà enregistrée.

## P3S2 — Vérification & sources

**Implémentation :** `modules/verification-sources.html` · identifiant `P3S2` · Evidence Lab.

**Question directrice :** « Comment vérifier une affirmation avec des sources réellement probantes ? »

### Concepts centraux
- source primaire / secondaire selon le contexte ;
- indépendance de la source ;
- date, version et provenance ;
- pertinence du passage ;
- relation claim ↔ preuve ;
- citation qui soutient réellement le claim ;
- triangulation lorsque l'enjeu le justifie ;
- tableau de preuves et traçabilité de la décision.

### Compétence de sortie
L'apprenant sait passer d'un claim à un dossier de preuve minimal, explicite et vérifiable.

### Hors périmètre
- mesure agrégée de performance sur un jeu de tests ;
- calibration des probabilités ou scores de confiance ;
- politique de décision à risque.

## P3S3 — Évaluation systématique

**Implémentation :** `modules/evaluation-systematique.html` · identifiant `P3S3` · Eval Lab + Regression Lab.

**Question directrice :** « Comment mesurer de façon reproductible la qualité d'un système sur un ensemble de cas ? »

### Concepts centraux
- objectif d'évaluation et critères ;
- jeu de tests représentatif ;
- cas nominaux, frontières et adversariaux simples ;
- rubric / grille de jugement ;
- baseline ;
- métriques adaptées à la tâche ;
- seuils de réussite explicites ;
- catégories d'échec ;
- régression entre versions ;
- reproductibilité et journal d'évaluation.

### Compétence de sortie
L'apprenant sait construire une petite évaluation qui distingue impression subjective, cas isolé et performance mesurée.

### Hors périmètre
- calibration probabiliste détaillée ;
- décision coût-sensible ;
- compromis risque/couverture.

## P3S4 — Incertitude, calibration & décision à risque

**Question directrice :** « Quand une confiance annoncée est-elle exploitable, et quand faut-il préférer l'abstention ? »

### Concepts centraux
- confiance déclarée ≠ probabilité de correction ;
- calibration sur un ensemble de cas ;
- surconfiance et sous-confiance ;
- diagramme de fiabilité ;
- erreur de calibration, introduite seulement après l'intuition ;
- selective prediction ;
- compromis couverture / risque ;
- seuil de décision dépendant des conséquences.

### Compétence de sortie
L'apprenant sait interpréter une mesure de confiance comme une propriété empirique à valider, et relier le seuil de décision au niveau de risque acceptable.

## Contrat NOVICE-FIRST commun

Chaque étape doit respecter `STANDARD_PEDAGOGIQUE_NOVICE.md` et contenir au minimum :
- prérequis et critère de réussite ;
- intuition avant vocabulaire technique ;
- définition rigoureuse ;
- exemple travaillé ;
- manipulation guidée ;
- exercice à compléter ;
- pratique ou diagnostic autonome ;
- misconceptions explicites ;
- auto-explication ;
- récupération active avec feedback ;
- transfert ;
- synthèse et pont vers l'étape suivante.

## Définition de fini

Une étape n'est gelable que lorsque :
1. son périmètre respecte ce document ;
2. le validateur pédagogique passe ;
3. le validateur spécifique du module passe ;
4. le Learning System et le cockpit restent cohérents ;
5. desktop, mobile, clair, sombre et projection ont été éprouvés ;
6. le parcours précédent gelé ne régresse pas.
