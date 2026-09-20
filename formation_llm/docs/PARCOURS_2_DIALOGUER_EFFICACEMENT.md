# Parcours 2 — Dialoguer efficacement

Date : 2026-09-20  
Statut : **spécification pédagogique verrouillée avant implémentation**  
Public : novice ayant terminé Parcours 0 et pouvant utiliser un LLM conversationnel.

## Finalité

Faire passer l'apprenant de « je formule une demande » à « je spécifie une tâche, j'organise le contexte, j'observe le résultat et j'itère ».

Le parcours ne doit pas enseigner des « mots magiques ». Il doit construire un modèle mental durable :

**objectif → contexte utile → contraintes → format → exemples → test → révision**

Les modèles évoluent ; cette boucle reste valable.

## Références de conception

Principes convergents retenus :
- OpenAI : instructions claires et spécifiques, contexte suffisant, séparation instructions/contenu, format de sortie explicite, exemples quand ils réduisent l'ambiguïté, itération ;
- Google : contraintes explicites, contexte pertinent, exemples, format structuré quand nécessaire ;
- Anthropic : structurer clairement les différentes parties du contexte et rendre les instructions non ambiguës ;
- standard LATENT NOVICE-FIRST : intuition avant jargon, exemple travaillé, étayage décroissant, récupération active, transfert.

## Ce que le parcours n'enseignera pas comme règle universelle

- « toujours donner un rôle » ;
- « toujours demander de penser étape par étape » ;
- « un prompt long est meilleur » ;
- « quelques exemples garantissent la vérité » ;
- « JSON demandé en langage naturel = JSON garanti » ;
- « plus de contexte = meilleure réponse ».

Ces formulations deviennent au contraire des misconceptions testées.

# Architecture proposée

## P2S1 — Spécifier une tâche

### Question-problème
Pourquoi « Fais-moi un bon résumé » donne-t-il des résultats difficiles à évaluer ?

### Squelette novice
1. objectif ;
2. public/destinataire ;
3. contexte nécessaire ;
4. contraintes ;
5. format de sortie ;
6. critère de réussite.

### Exemple travaillé
Transformer :
> Résume ce texte.

en une spécification vérifiable :
- tâche : résumer ;
- public : élève de Terminale ;
- longueur : 120–150 mots ;
- contenu obligatoire : 3 idées ;
- contenu interdit : information absente du document ;
- sortie : paragraphe + 3 mots-clés.

### Pratique guidée
« Prompt Builder » à 6 zones. L'apprenant active/désactive une information et prédit ce que cela change.

### Misconceptions
- P2S1.LONGER — plus long ≠ meilleur ;
- P2S1.ROLE_MAGIC — rôle ≠ garantie de qualité ;
- P2S1.VAGUE — objectif vague ≠ liberté utile ;
- P2S1.FORMAT — demander un format ≠ valider le contenu.

### Critère de réussite
À partir d'une demande floue, produire une spécification testable et dire quelles informations sont réellement nécessaires.

---

## P2S2 — Exemples, contre-exemples et format

### Question-problème
Pourquoi une règle expliquée en une phrase peut-elle rester ambiguë ?

### Notions
- zero-shot ;
- exemple de référence ;
- few-shot ;
- exemple négatif / frontière ;
- schéma de sortie ;
- validation de sortie.

### Exemple travaillé
Classification de messages en `question / demande / incident`.
Comparer :
1. instruction seule ;
2. instruction + 2 exemples ;
3. instruction + cas frontière ;
4. instruction + format contrôlable.

### Limites
Un exemple peut aider le modèle à reproduire une structure ou une décision, mais peut aussi l'ancrer sur un motif trop étroit.

### Misconceptions
- P2S2.EXAMPLE_TRUTH — exemple ≠ preuve ;
- P2S2.MORE_SHOTS — plus d'exemples ≠ toujours mieux ;
- P2S2.JSON — demander JSON ≠ sortie structurellement garantie ;
- P2S2.COPY_PATTERN — imitation de forme ≠ compréhension du domaine.

### Critère de réussite
Choisir si une tâche a besoin d'exemples et concevoir un cas frontière utile.

---

## P2S3 — Organiser le contexte

### Question-problème
Si le modèle possède déjà une grande fenêtre de contexte, pourquoi faut-il encore sélectionner et structurer l'information ?

### Squelette novice
**instructions ≠ données ≠ exemples ≠ historique ≠ ressources externes**

### Notions
- fenêtre de contexte ;
- pertinence ;
- bruit contextuel ;
- délimitation ;
- hiérarchie des instructions dans une application ;
- contenu non fiable ;
- prompt injection comme conflit entre contenu et instructions.

### Activité principale
Un « Context Mixer » contient 12 blocs. L'apprenant sélectionne ceux à fournir pour résoudre une tâche donnée. Certains sont utiles, d'autres redondants ou non fiables.

### Limite
Le parcours n'entre pas encore dans le retrieval/RAG : il apprend à raisonner sur **ce qui doit être présent dans le contexte**. Le Parcours 4 enseigne comment récupérer ces éléments.

### Misconceptions
- P2S3.MORE_CONTEXT — plus de contexte ≠ meilleure réponse ;
- P2S3.CONTEXT_MEMORY — contexte ≠ mémoire durable ;
- P2S3.DATA_INSTRUCTION — un document fourni ≠ instruction de confiance ;
- P2S3.RETRIEVAL — contexte pertinent ≠ retrieval réussi.

### Critère de réussite
Justifier pourquoi chaque bloc d'information entre — ou n'entre pas — dans le contexte.

---

## P2S4 — Itérer, décomposer et vérifier

### Question-problème
Pourquoi chercher « le prompt parfait » est-il une mauvaise stratégie pour une tâche complexe ?

### Boucle
**spécifier → produire → observer → tester → corriger**

### Notions
- décomposition ;
- conversation multi-tour ;
- sortie intermédiaire observable ;
- critères de test ;
- révision ;
- reproductibilité imparfaite.

### Exemple travaillé
Transformer une tâche complexe « préparer une activité de cours » en :
1. cadrage des objectifs ;
2. proposition de plan ;
3. contrôle des contraintes ;
4. production ;
5. vérification avec grille.

On ne demande pas au modèle de révéler un raisonnement interne caché ; on demande des **artefacts vérifiables** : plan, tableau de contrôle, références, sorties intermédiaires utiles.

### Misconceptions
- P2S4.ONE_SHOT — un seul prompt ≠ workflow robuste ;
- P2S4.PERFECT_PROMPT — prompt parfait ≠ objet stable universel ;
- P2S4.REASONING_TEXT — texte de raisonnement généré ≠ preuve de correction ;
- P2S4.SAME_INPUT — même entrée ≠ sortie strictement identique.

### Critère de réussite
Décomposer une tâche et construire une boucle de vérification avec critères observables.

# Frontières avec les autres parcours

- **Parcours 3 — Fiabilité** : vérifie les claims, preuves, incertitude et régressions.
- **Parcours 4 — RAG** : apprend retrieval, chunking, reranking et grounding.
- **Parcours 5 — Outils & agents** : exécute des actions, appelle des fonctions, maintient un état de workflow.
- **Parcours 6 — IA & pédagogie** : transpose ces mécanismes aux apprentissages et à l'évaluation.

Parcours 2 doit préparer ces notions sans les absorber.

# Évaluation du parcours

Chaque étape utilisera le contrat LATENT V1 :
- complétion ;
- quiz de récupération avec feedback ;
- transfert ;
- maîtrise à 80 % quiz + 80 % transfert ;
- misconceptions persistantes ;
- réactivation différée.

## Transfert final proposé

Cas : « Un professeur veut transformer un document institutionnel en activité pour des élèves, avec contraintes de programme, durée, niveau et format. »

L'apprenant doit :
1. repérer les informations manquantes ;
2. séparer instructions et document source ;
3. produire une spécification ;
4. décider si des exemples sont utiles ;
5. proposer une décomposition ;
6. définir comment vérifier la sortie.

Ce transfert est volontairement différent des exemples précédents mais mobilise les mêmes principes.
