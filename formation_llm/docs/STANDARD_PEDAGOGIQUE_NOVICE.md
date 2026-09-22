# Standard pédagogique NOVICE-FIRST — Formation LLM

Version : 2.0 — MANIPULATION-FIRST  
Date : 2026-09-22  
Statut : pilote à valider sur élèves réels

## Pourquoi une version 2

Le test terrain mené auprès d'élèves de Terminale a révélé une faiblesse que le standard V1 ne détectait pas : un module pouvait contenir toutes les briques attendues — intuition, définition, exemple travaillé, laboratoire, quiz et transfert — tout en restant trop difficile pour un novice.

Le problème observé est structurel : trop de vocabulaire et d'explications peuvent précéder la première action significative. La présence d'un laboratoire ne garantit pas que l'apprenant construit activement son modèle mental.

La V2 remplace donc une logique essentiellement **séquentielle** par une logique de **microcycles**.

## Principe central : faire naître le besoin de la notion

Une notion nouvelle ne doit plus être présentée principalement sous la forme :

`définition → définition → définition → exemple → laboratoire`

La forme cible devient :

`prédire → manipuler → observer → nommer → expliquer → refaire autrement`

Chaque microcycle introduit un petit nombre d'éléments nouveaux puis les fait utiliser immédiatement.

## Références structurantes

Le standard s'appuie notamment sur :
- IES / What Works Clearinghouse — *Organizing Instruction and Study to Improve Student Learning* : alterner exemples travaillés et résolution, combiner verbal et graphique, relier concret et abstrait ;
- EEF — *Metacognition and Self-Regulated Learning* : enseignement explicite, modélisation, étayage puis retrait progressif ;
- CAST UDL Guidelines 3.0 : engagement, action, expression, variété des modalités et feedback orienté vers l'action ;
- Cognitive Load Theory / worked-example effect : guider davantage les novices, éviter la recherche inutile et segmenter les chaînes complexes ;
- recherche sur la pratique de récupération : rappeler activement après construction initiale du modèle mental.

Les seuils chiffrés ci-dessous sont des **garde-fous d'ingénierie pédagogique internes**, pas des lois universelles issues d'une publication.

## Le microcycle NOVICE-FIRST V2

Pour une idée nouvelle, suivre autant que possible ce cycle :

1. **Situation concrète** — un problème compréhensible sans jargon.
2. **Prédiction** — l'apprenant doit choisir, anticiper ou formuler une hypothèse.
3. **Manipulation** — il change une donnée, un composant, un ordre ou une décision.
4. **Observation** — le système rend visible une conséquence.
5. **Nom de la notion** — le vocabulaire technique apparaît parce qu'il devient utile.
6. **Explication courte** — pourquoi le résultat s'est produit.
7. **Nouvel essai proche** — variation permettant de vérifier que l'idée n'était pas liée à un seul exemple.
8. **Feedback orienté action** — quoi corriger et quoi essayer ensuite.

Un gros laboratoire final peut exister, mais il ne doit plus porter seul la charge de manipulation.

## Garde-fous de conception internes

Pour un module destiné à de vrais novices :

- la première **action cognitive significative** doit apparaître très tôt ; cible interne : avant environ **350 mots visibles** ;
- ne pas imposer un glossaire massif avant l'action ; cible interne : **4 termes nouveaux maximum** avant la première manipulation ;
- entre deux manipulations significatives, éviter d'introduire plus de **3 à 4 nouveaux termes** sans réutilisation ;
- viser au moins **3 manipulations significatives avant le quiz final** ;
- une manipulation significative doit comporter au minimum **action + conséquence observable** ; un bouton qui ne fait qu'afficher une définition ne suffit pas ;
- au moins une manipulation doit demander une **prédiction avant feedback** ;
- au moins une manipulation doit conduire à une **explication causale** : « qu'est-ce qui a changé et pourquoi ? » ;
- une activité de classement doit demander une justification ou produire un contre-exemple, pas seulement révéler une étiquette ;
- la production autonome longue arrive après plusieurs essais courts et guidés.

## Vocabulaire : juste à temps

Le vocabulaire expert est nécessaire, mais son ordre change.

### Couche essentielle
Les mots indispensables à la tâche en cours. Ils sont introduits au moment où l'apprenant vient d'observer le phénomène.

### Couche de consolidation
Les termes nécessaires pour relier plusieurs microcycles et construire une carte mentale.

### Couche d'approfondissement
Les distinctions utiles mais non indispensables à la première compréhension — variantes d'architecture, catégories juridiques, vocabulaire de recherche, nuances historiques. Cette couche doit être repliable ou clairement optionnelle.

Un module de début de parcours ne doit pas faire dépendre sa compréhension centrale de la mémorisation de la couche d'approfondissement.

## Exemple travaillé : nouveau rôle

L'exemple travaillé reste important, mais il ne constitue plus nécessairement la première rencontre avec la notion.

Dans V2 :
- une micro-manipulation simple peut précéder l'exemple ;
- l'exemple travaillé formalise ensuite ce que l'apprenant vient d'observer ;
- chaque étape doit dire **ce qui change**, **pourquoi**, et **ce qui aurait pu être confondu** ;
- l'exemple est suivi rapidement d'un cas très proche où l'apprenant complète une partie de la démarche.

## Explication et représentation

- préférer les objets concrets, cartes, flux, curseurs, composants activables et simulations simples avant les diagrammes complets ;
- rapprocher visuellement explication, donnée manipulée et résultat ;
- une formule doit être précédée d'une intuition et d'une manipulation ou d'un exemple numérique ;
- une métaphore doit être accompagnée de sa limite ;
- les détails avancés ne doivent pas interrompre le parcours principal.

## Feedback

Le feedback ne doit pas seulement dire « correct / incorrect ».

Il doit, selon le cas :
- nommer l'erreur de raisonnement ;
- montrer la conséquence observable ;
- rappeler le critère qui permet de décider ;
- proposer l'action suivante ;
- distinguer une erreur de vocabulaire d'une erreur de modèle mental.

## Récupération et transfert

Le quiz final reste une preuve de récupération, mais il ne doit plus être le premier endroit où l'apprenant doit réellement raisonner.

Avant le quiz :
- plusieurs décisions courtes ;
- au moins un essai avec aide partielle ;
- au moins un contre-exemple ;
- au moins une explication produite par l'apprenant.

Le transfert doit changer la surface du problème sans changer le principe appris.

## Diagnostic initial

Un QCM de reconnaissance ne suffit pas à autoriser le saut d'une séquence de construction conceptuelle.

Pour les modules V2 pilotes :
- le diagnostic peut adapter la quantité d'aide ;
- il ne doit pas supprimer les micro-manipulations fondatrices ;
- une future « voie rapide » devra inclure au moins une petite tâche de raisonnement ou d'explication, pas uniquement des réponses de reconnaissance.

## Trois couches de lecture

### 1. Comprendre
Microcycles indispensables, langage ordinaire, exemples concrets et feedback.

### 2. Approfondir
Nuances, formalismes, taxonomies secondaires, limites et détails techniques.

### 3. Formateur
Erreurs attendues, questions de relance, critères de réussite, variantes de débrief.

Les couches 2 et 3 ne doivent pas augmenter la charge cognitive du parcours novice par défaut.

## États pédagogiques

La présence des marqueurs structurels ne suffit plus à attribuer « novice-ready ».

### `design-ready`
Le contenu est scientifiquement et techniquement cohérent, mais n'a pas encore passé le protocole novice.

### `pilot-ready`
Le module respecte les garde-fous V2 et peut être testé auprès d'apprenants réels.

### `novice-ready`
Le module a passé un test utilisateur novice avec résultats documentés, corrections éventuelles et nouvelle vérification.

Un validateur automatique peut certifier `design-ready` ou `pilot-ready`. Il **ne peut pas à lui seul** certifier `novice-ready`.

## Protocole de validation terrain

Pour un module pilote, relever au minimum :

1. temps avant la première action ;
2. temps avant le premier blocage nécessitant une aide humaine ;
3. nombre et nature des demandes d'aide ;
4. erreurs récurrentes et vocabulaire incompris ;
5. sections relues plusieurs fois ;
6. réussite des micro-défis ;
7. capacité à expliquer la notion sans regarder l'écran ;
8. réussite d'un transfert légèrement différent ;
9. perception qualitative : trop abstrait, trop dense, trop lent, trop facile, utile ou non.

Le retour qualitatif d'un groupe réel est une donnée pédagogique de premier rang ; il doit pouvoir invalider un statut obtenu uniquement par validation automatique.

## Critère de réussite V2

À la fin d'un module, un novice doit pouvoir :

1. montrer le phénomène sur une manipulation simple ;
2. expliquer avec ses mots ce qui change ;
3. nommer correctement les notions centrales ;
4. justifier une décision et pas seulement reconnaître une bonne réponse ;
5. éviter les confusions principales ;
6. résoudre un cas proche ;
7. transférer à une situation différente ;
8. dire ce que la notion ne permet pas de conclure.

## Sources structurantes

- IES / WWC — *Organizing Instruction and Study to Improve Student Learning*
- EEF — *Metacognition and Self-Regulated Learning*
- CAST — *UDL Guidelines 3.0*
- Sweller et travaux sur la Cognitive Load Theory / worked examples
- Dunlosky et al. — techniques d'apprentissage et pratique de récupération

## Décision de projet — 22 septembre 2026

Le développement horizontal de nouveaux parcours est suspendu le temps de valider le nouveau grain pédagogique sur **Parcours 0**.

Parcours 0 devient le pilote V2.  
Les modules suivants ne seront pas reconstruits en série avant un nouveau test d'élèves sur ce pilote.
