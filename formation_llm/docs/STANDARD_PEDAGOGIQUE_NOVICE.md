# Standard pédagogique NOVICE-FIRST — Formation LLM

Version : 1.0  
Date : 2026-09-19

## Pourquoi ce standard

La plateforme actuelle est techniquement riche mais plusieurs modules supposent que l'apprenant possède déjà un modèle mental des notions présentées. Un laboratoire interactif ne remplace pas une séquence d'enseignement.

Le standard NOVICE-FIRST devient le contrat de conception de tout nouveau module et le cadre de remédiation des modules existants.

## Principes de référence

Le standard s'appuie notamment sur :
- IES / What Works Clearinghouse — *Organizing Instruction and Study to Improve Student Learning* : exemples travaillés, combinaison verbal/graphique, concret/abstrait, quizzing, questions explicatives et réactivation différée.
- Cognitive Load Theory : limiter la charge extrinsèque et fournir davantage de guidage aux novices ; les exemples travaillés et les problèmes partiellement complétés sont particulièrement utiles au début.
- EEF — *Metacognition and Self-Regulated Learning* : enseigner explicitement les stratégies, modéliser, guider puis retirer progressivement l'étayage.
- CAST UDL Guidelines 3.0 : relier les acquis antérieurs, proposer plusieurs représentations, soutenir la navigation et varier les modalités d'action/expression.
- Dunlosky et al. : pratique de récupération et pratique distribuée parmi les techniques d'apprentissage les plus robustes.

## Un lab ne peut plus être la première explication

Ordre attendu pour une notion nouvelle :

1. **Situation-problème concrète** — pourquoi cette notion existe-t-elle ?
2. **Activation des acquis** — 1 à 3 rappels nécessaires.
3. **Intuition en langage ordinaire** — sans jargon non défini.
4. **Définition rigoureuse** — vocabulaire scientifique/technique exact.
5. **Représentation visuelle ou concrète** — reliée explicitement à l'abstraction.
6. **Exemple travaillé pas à pas** — chaque étape explique ce qui change et pourquoi.
7. **Manipulation guidée** — l'apprenant modifie un paramètre avec consigne d'observation.
8. **Problème partiellement complété** — l'étayage commence à diminuer.
9. **Pratique autonome** — sans solution visible immédiatement.
10. **Erreur fréquente / contre-exemple** — montrer pourquoi une intuition séduisante est fausse.
11. **Auto-explication** — « Expliquez avec vos mots pourquoi… ».
12. **Récupération active** — questions sans réponse affichée par défaut.
13. **Feedback explicatif** — pourquoi la bonne réponse est bonne et les distracteurs sont faux.
14. **Transfert** — nouvelle situation avec surface différente mais même principe.
15. **Synthèse** — 3 à 7 idées maximum à retenir.
16. **Pont vers la suite** — ce que cette notion rend maintenant possible.

## Trois couches de lecture

Chaque module doit être utilisable par un novice sans noyer un apprenant plus avancé.

### Couche 1 — Comprendre
Explications indispensables, exemples, schémas, pratique guidée.

### Couche 2 — Approfondir
Formalisme, limites, variantes d'architecture, détails techniques.

### Couche 3 — Formateur
Questions à poser, erreurs attendues, critères de réussite, pistes de débrief.

Le contenu expert ne doit pas interrompre la progression novice : il est repliable ou réservé au mode formateur.

## Règles de langage

- Tout terme technique doit être défini avant son premier usage substantiel.
- Une métaphore doit être suivie de ses limites.
- Une formule doit être précédée d'une intuition et suivie d'un exemple numérique.
- Ne jamais utiliser une phrase-mémo comme substitut de définition.
- Éviter les catégories binaires simplistes (« comprend / ne comprend pas », « température basse = fiable »).
- Une simulation doit être explicitement distinguée des valeurs d'un modèle réel.

## Charge cognitive

Pour une nouvelle micro-séquence :
- introduire peu de nouveaux éléments à la fois ;
- segmenter les chaînes complexes ;
- éviter les animations décoratives concurrentes ;
- rapprocher visuellement explication, schéma et donnée correspondante ;
- ne pas demander une production autonome avant d'avoir montré au moins un exemple complet ;
- retirer progressivement l'aide lorsque la maîtrise augmente.

## Pratique et évaluation

Chaque module NOVICE-FIRST doit contenir :
- un diagnostic d'entrée ou rappel de prérequis ;
- au moins un exemple travaillé ;
- au moins une pratique guidée ;
- au moins un problème partiellement complété ou étape à compléter ;
- au moins une tâche de transfert ;
- au moins une activité d'auto-explication ;
- un quiz de récupération avec feedback explicatif ;
- une synthèse de sortie ;
- une vérification de maîtrise qui ne repose pas uniquement sur « Marquer acquis ».

## Critère de réussite

Un stagiaire novice doit pouvoir, sans ressource externe :
1. expliquer la notion en langage courant ;
2. employer correctement son vocabulaire ;
3. interpréter un exemple ;
4. éviter les principales confusions ;
5. résoudre une situation proche ;
6. transférer la notion à une situation nouvelle ;
7. dire ce que la notion ne permet PAS de conclure.

## Validation humaine obligatoire

Le validateur automatique ne prouve jamais qu'un contenu est pédagogiquement excellent. Il empêche seulement les omissions structurelles évidentes. Un module ne peut passer à `novice-ready` qu'après :
- lecture complète comme novice ;
- test de navigation clavier/mobile/projection ;
- test des activités ;
- relecture scientifique ;
- test utilisateur avec au moins un novice réel ou un protocole simulant explicitement les connaissances initiales.

## Sources structurantes

- https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition
- https://udlguidelines.cast.org/
- https://link.springer.com/article/10.1007/s10648-010-9145-4
- https://link.springer.com/article/10.1007/s10648-019-09465-5
- https://journals.sagepub.com/doi/10.1177/1529100612453266
