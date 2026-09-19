# Plan de remédiation pédagogique — Formation LLM

Date : 2026-09-19

## Diagnostic

L'application actuelle doit être considérée comme une **V0 fonctionnelle avec dette pédagogique élevée**.

Audit structurel initial :

| Module | Mots visibles approx. | Exemple travaillé | Transfert | Synthèse | Quiz/feedback |
|---|---:|---|---|---|---|
| Parcours 0 — Situer les LLM | 1679 | non | non | non | oui |
| Tokens & contexte | 1660 | non | non | oui | oui |
| Attention | 1428 | non | non | non | oui |
| Transformer Block | 988 | non | non | non | oui |
| Sampling | 1161 | non | non | non | oui |
| Hallucination | 744 | non | non | non | oui |
| RAG | 641 | non | non | non | non |

Le nombre de mots n'est pas un critère de qualité en soi ; il sert ici de signal conjoint avec l'absence d'étayage.

## Priorité de reconstruction

### Lot 1 — Fondations réellement accessibles
1. Parcours 0 — Situer les LLM
2. Parcours 1 Étape 1 — Tokens, représentations, contexte

Objectif : construire le vocabulaire et les représentations mentales dont dépend tout le reste.

### Lot 2 — Sous le capot sans saut conceptuel
3. Attention
4. Transformer Block
5. Sampling

Objectif : une chaîne causale continue de `texte` à `token suivant`, avec exemples numériques travaillés.

### Lot 3 — Fiabilité et recherche
6. Hallucination Lab
7. RAG Lab

Objectif : ne plus présenter des métriques ou stratégies avant d'avoir construit les concepts de preuve, retrieval, chunk, pertinence et évaluation.

## Gabarit obligatoire de reconstruction

Chaque module sera restructuré avec les blocs suivants, dans cet ordre logique :

`mission → prérequis → intuition → définition → exemple travaillé → lab guidé → exercice à compléter → pratique autonome → piège → auto-explication → quiz+feedback → transfert → synthèse → pont suivant`.

Tous les blocs n'ont pas besoin d'être longs ; ils doivent être présents et cohérents.

## Progression de l'étayage

Niveau A — **Je regarde** : exemple complètement résolu et commenté.  
Niveau B — **Nous faisons** : activité guidée, étapes explicites.  
Niveau C — **Je complète** : certaines étapes sont masquées.  
Niveau D — **Je fais** : tâche autonome proche.  
Niveau E — **Je transfère** : contexte différent, même principe.

## Architecture de contenu

Chaque notion centrale possède trois formulations :
- **Intuition** : phrase compréhensible sans prérequis nouveau ;
- **Définition** : formulation techniquement exacte ;
- **Limite** : ce qu'il ne faut pas en conclure.

Chaque formule possède :
- sens des variables ;
- exemple numérique ;
- résultat interprété ;
- erreur de lecture fréquente.

Chaque lab possède :
- objectif d'observation ;
- consigne avant manipulation ;
- prédiction attendue ;
- manipulation ;
- observation ;
- explication ;
- transfert.

## Vigilance automatisée

Un manifeste pédagogique recense tous les modules.

Les modules actuels sont explicitement marqués `remediation-required` : cette dette est donc visible et ne peut plus être confondue avec un état « terminé ».

Un module marqué `novice-ready` doit exposer dans son HTML des marqueurs structurants :
- `data-pedagogy="prerequisites"`
- `data-pedagogy="intuition"`
- `data-pedagogy="definition"`
- `data-pedagogy="worked-example"`
- `data-pedagogy="guided-practice"`
- `data-pedagogy="completion"`
- `data-pedagogy="misconception"`
- `data-pedagogy="self-explanation"`
- `data-pedagogy="retrieval"`
- `data-pedagogy="feedback"`
- `data-pedagogy="transfer"`
- `data-pedagogy="recap"`

Le validateur échoue si un module `novice-ready` ne satisfait pas ce contrat.

Les modules existants bénéficient d'un statut de dette historique uniquement pendant leur reconstruction. **Tout nouveau module créé après ce jalon doit être NOVICE-FIRST dès sa première intégration.**

## Test novice

Pour chaque module reconstruit, protocole minimal :
1. donner uniquement les prérequis déclarés ;
2. interdire l'utilisation d'une connaissance externe non introduite ;
3. noter chaque terme utilisé avant définition ;
4. noter chaque étape où l'apprenant doit inférer un mécanisme non expliqué ;
5. vérifier qu'il peut expliquer le concept sans reprendre mot pour mot la page ;
6. lui faire résoudre une situation de transfert ;
7. mesurer les erreurs restantes et les réinjecter comme feedback ou contre-exemple.

## Définition de fini

Le module n'est pas « fini » lorsque l'animation fonctionne. Il est fini lorsque :
- l'explication est autosuffisante pour le public déclaré ;
- les activités sont alignées avec les objectifs ;
- les feedbacks expliquent ;
- une tâche de transfert est réussissable ;
- les confusions principales sont traitées ;
- la navigation/accessibilité est validée ;
- le statut `novice-ready` passe la CI.
