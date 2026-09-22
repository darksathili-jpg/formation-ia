# Audit pédagogique terrain — LATENT / Formation LLM

Date : 2026-09-22  
Déclencheur : test du début de la formation auprès d'élèves de Terminale  
Décision : dette pédagogique confirmée

## Retour observé

Les élèves ont signalé :
- difficulté importante à comprendre le début de la formation ;
- explications jugées trop générales ou insuffisamment développées ;
- manque de manipulation ;
- difficulté à construire un modèle mental stable des notions.

Ce retour est considéré comme une donnée de validation, pas comme une simple préférence utilisateur.

## Mesures sur les premiers modules

Analyse statique du contenu visible avant la première pratique guidée :

| Module | Mots visibles approx. | Mots avant le premier lab guidé | Situation |
| --- | ---: | ---: | --- |
| P0 — Situer les LLM | ~2637 | ~1211 | glossaire et exemple avant manipulation |
| P1S1 — Tokens & contexte | ~2407 | ~908 | 12 notions présentées avant Tokenizer Lab |
| P1S2 — Attention | ~1904 | ~794 | Q/K/V et calculs avant Attention Lab |

Le problème n'est donc pas l'absence totale d'interactivité. Les modules contiennent des contrôles. Le problème est le **moment**, le **type** et la **densité** des interactions.

## Diagnostic

### 1. Dette de charge cognitive — élevée
Trop d'éléments nouveaux doivent être maintenus en mémoire avant qu'un phénomène concret ne permette de les organiser.

### 2. Dette de manipulation — élevée
Une partie de l'interactivité est exploratoire ou déclarative : cliquer pour afficher une définition n'est pas équivalent à modifier une variable, prédire une conséquence et interpréter le résultat.

### 3. Dette d'explication — moyenne à élevée
Les définitions sont souvent exactes mais condensées. Il manque fréquemment l'étape intermédiaire : exemple concret, variation, contre-exemple, puis seulement abstraction.

### 4. Dette de diagnostic initial — moyenne
Trois QCM par module mesurent surtout la reconnaissance et ne suffisent pas à démontrer un modèle mental robuste.

### 5. Dette de validation — critique
Le label `novice-ready` a été accordé sur des critères automatiques et des revues internes alors que le standard déclarait déjà qu'un test humain novice était obligatoire.

## Ce qui doit être conservé

- rigueur scientifique ;
- interface LATENT ;
- progression locale ;
- quiz de récupération ;
- tâches de transfert ;
- misconceptions ;
- modes formateur et projection ;
- autonomie sans API ;
- laboratoires existants lorsqu'ils produisent une conséquence observable.

## Stratégie retenue

1. passer le standard en NOVICE-FIRST v2 ;
2. suspendre l'extension fonctionnelle ;
3. reconstruire P0 comme pilote manipulation-first ;
4. faire apparaître le premier acte cognitif très tôt ;
5. remplacer le glossaire massif par du vocabulaire juste à temps ;
6. multiplier les microcycles action → conséquence → explication ;
7. empêcher le diagnostic de faire sauter les manipulations fondatrices du pilote ;
8. re-tester P0 auprès d'élèves avant généralisation à P1.

## Critères de succès du prochain test P0

- les élèves savent distinguer modèle et application sans réciter une définition ;
- ils peuvent expliquer d'où viennent mémoire, recherche documentaire et outils ;
- ils reconstruisent la chaîne IA → ML → deep learning → LLM ;
- ils réussissent un cas de transfert ;
- le nombre de demandes d'aide conceptuelle diminue ;
- aucun élève ne décrit le début comme une succession de définitions à mémoriser.

## Statut

P0 doit être considéré comme **pilot-ready** après reconstruction, puis seulement comme **novice-ready** après validation terrain.
