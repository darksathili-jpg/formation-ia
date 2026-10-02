# Audit architecture & pédagogie — LATENT V3

Date : 2026-10-02  
Branche : `refactor/latent-v3-architecture`  
Statut : décision d'architecture avant migration

## 1. Conclusion exécutive

LATENT possède déjà des actifs rares pour un prototype pédagogique :

- un référentiel et un manifeste pédagogique ;
- un Learning System local avec diagnostic, misconceptions, quiz, transfert, maîtrise et réactivation ;
- des laboratoires interactifs spécialisés ;
- trois modes d'usage (stagiaire, formateur, projection) ;
- une CI riche en garde-fous ;
- une politique d'autonomie sans API obligatoire ;
- un standard NOVICE-FIRST V2 désormais manipulation-first.

Mais l'architecture technique actuelle ne peut pas devenir sereinement une application de formation de référence sans refonte structurée.

Le problème principal n'est pas la technologie HTML : c'est le **couplage**. Dans les modules actuels, contenu pédagogique, shell, styles, moteur de progression, stockage, analytics implicites et simulation de laboratoire vivent dans le même fichier. Les corrections récentes (Tokenizer Lab, header formateur, projection) montrent que les comportements transversaux sont encore corrigés page par page.

Décision : passer à un **monolithe modulaire à architecture hexagonale**, piloté pédagogiquement par **Evidence-Centered Design for Learning (ECDL)**, et migrer progressivement avec un **Strangler Fig**.

## 2. Audit technique

### Forces à préserver

1. **Autonomie** : la plateforme fonctionne sans service distant obligatoire.
2. **Résilience locale** : fallback de stockage et absence de secrets client.
3. **CI pédagogique et UI** : le projet possède déjà une culture de garde-fous.
4. **Labs dédiés** : tokenizer, embeddings, contexte, attention, sampling, RAG, evidence/eval.
5. **Web first** : tout le contenu peut être projeté ou utilisé dans un navigateur.

### Dette critique — P0

#### T1 — Module = page + application

Chaque module est un gros HTML autonome. Les responsabilités suivantes sont dupliquées :

- navigation ;
- thème ;
- mode formateur ;
- projection ;
- progressive disclosure ;
- stockage ;
- calcul de maîtrise ;
- styles LATENT ;
- feedback ;
- instrumentation des labs.

Conséquence : une règle transverse n'a pas une source unique de vérité.

#### T2 — Contenu et rendu sont indissociables

Une correction scientifique ou pédagogique demande de modifier du HTML/JS/CSS. Cela rend plus difficiles :

- revue scientifique ;
- comparaison de versions ;
- localisation ;
- génération de variantes ;
- export papier ;
- réutilisation du même contenu dans Web et Electron ;
- tests structurels du contenu.

#### T3 — Validation trop textuelle

Les validateurs actuels ont été très utiles, mais beaucoup vérifient la présence de chaînes, IDs ou règles CSS. Il faut conserver ces gardes tout en ajoutant :

- tests unitaires du domaine ;
- tests de contrats des ports ;
- tests de composants ;
- tests de comportement des labs ;
- tests end-to-end des parcours critiques ;
- tests de migration de données.

#### T4 — Stockage lié au navigateur

`localStorage` convient au prototype mais ne doit pas être le contrat du domaine. Le domaine doit parler à un `ProgressRepository` et à un `LearningEventRepository`. Le navigateur, Electron et les tests fourniront chacun leur adaptateur.

#### T5 — Pas de modèle d'événement d'apprentissage

L'état final est mémorisé, mais il manque une chronologie normalisée : prédiction, tentative, feedback, correction, aide, temps sur activité, transfert, réactivation. Sans ces événements, le test terrain reste difficile à analyser quantitativement.

## 3. Audit pédagogique

### Forces

- NOVICE-FIRST V2 a corrigé un biais majeur : définition massive avant action.
- la maîtrise exige quiz + transfert ;
- misconceptions et remédiations existent ;
- la réactivation espacée existe ;
- les modes formateur/projection facilitent l'usage réel ;
- le retour d'élèves est désormais capable d'invalider un statut automatique.

### Dette pédagogique

#### P1 — Statut `novice-ready` à requalifier

Le standard V2 affirme qu'une CI ne peut pas certifier seule `novice-ready`. Pourtant la majorité des modules porte encore ce statut sur la base d'une validation antérieure. Ils doivent progressivement repasser par :

`design-ready → pilot-ready → novice-ready`

avec preuve terrain attachée au manifeste.

#### P2 — Preuves d'apprentissage pas assez explicites dans le modèle de contenu

Chaque module doit déclarer séparément :

- compétences visées ;
- misconceptions ;
- preuves acceptables ;
- activités qui produisent ces preuves ;
- critères de réussite ;
- tâches de transfert ;
- réactivation.

Aujourd'hui ces éléments existent, mais sont dispersés entre HTML, JSON et validateurs.

#### P3 — Besoin de parcours de profondeur

Le benchmark FIDLE montre l'intérêt d'une progression claire par profondeur : découverte sans prérequis, pratique avec outils, niveau avancé. LATENT doit proposer trois vues cohérentes du même référentiel :

1. **Découvrir** — Terminale / novice ;
2. **Pratiquer** — formateur / utilisateur régulier ;
3. **Approfondir** — technique / expert.

Ces parcours ne doivent pas être trois cours copiés : ils doivent sélectionner des activités différentes sur un même graphe de compétences.

#### P4 — Manque d'activités authentiques transversales

À développer :

- mini-projets ;
- diagnostics de systèmes défaillants ;
- comparaison de modèles/approches ;
- cas de données imparfaites ;
- étude de résultats qui échouent (« failure-first ») ;
- scénarios pédagogiques réels ;
- enjeux sociétaux/éthiques/juridiques reliés à des décisions concrètes.

## 4. Benchmark FIDLE — ce que LATENT doit retenir

FIDLE n'est pas un modèle à copier graphiquement. Les points structurants à retenir sont :

- une entrée réellement sans prérequis ;
- des parcours de profondeur explicites ;
- une forte articulation théorie / illustration / pratique ;
- embeddings comme fondation avant les Transformers ;
- méthodologie IA en tant que compétence propre ;
- entraînement, évaluation, robustesse et déploiement ;
- étude de ce qui échoue, pas uniquement des démonstrations qui fonctionnent ;
- ressources ouvertes et réutilisables.

LATENT peut aller plus loin sur l'adaptation, la manipulation, la traçabilité de maîtrise et l'autonomie hors ligne.

## 5. Architecture pédagogique retenue : ECDL

Pour chaque compétence :

### Student / Competency Model

Que doit savoir ou savoir faire l'apprenant ? À quel niveau ? Avec quels prérequis ?

### Evidence Model

Quelles observations permettent de conclure ? Une bonne réponse reconnue n'est pas nécessairement une preuve suffisante.

### Task Model

Quelles tâches provoquent les comportements observables attendus ?

### Pedagogical Model

Quel étayage, quelle séquence de microcycles, quels feedbacks, quels contre-exemples et quel retrait progressif de l'aide ?

Contrat LATENT :

`outcome → misconception → evidence → task/microcycle → feedback → transfer → mastery → review`

## 6. Architecture logicielle retenue

### Style

- monolithe modulaire ;
- architecture hexagonale / Ports & Adapters ;
- bounded contexts légers ;
- dépendances orientées vers le domaine ;
- renderer Web indépendant d'Electron.

### Contextes

1. `curriculum` — parcours, modules, concepts, sources ;
2. `learning` — progression, prérequis, maîtrise, remédiation, réactivation ;
3. `activities` — labs et microcycles ;
4. `assessment` — quiz, transfert, rubrics, evidence ;
5. `analytics` — événements d'apprentissage ;
6. `runtime` — Web/Electron, import/export, mises à jour.

### Ports principaux

- `ContentRepository`
- `ProgressRepository`
- `LearningEventRepository`
- `Clock`
- `ImportExportPort`
- `ExternalLinkPort`
- `UpdatePort`

### Adaptateurs initiaux

- navigateur : IndexedDB + import/export JSON ;
- Electron : shell sécurisé + même renderer ;
- tests : mémoire ;
- legacy : adaptateur vers les pages HTML existantes durant la migration.

## 7. Distribution autonome

Electron est retenu comme **shell desktop de référence**, pas comme cœur applicatif.

Motifs :

- runtime Chromium homogène sur les PC de formation ;
- fonctionnement hors ligne ;
- packaging Windows ;
- accès contrôlé à import/export et fichiers ;
- même UI HTML/CSS/JS que le Web.

Le renderer restera compatible navigateur afin de conserver GitHub Pages/PWA comme deuxième cible.

Règles de sécurité :

- `nodeIntegration: false` ;
- `contextIsolation: true` ;
- `sandbox: true` ;
- CSP restrictive ;
- protocole applicatif personnalisé plutôt que `file://` ;
- preload minimal ;
- validation de chaque message IPC ;
- aucune API Electron générique exposée au renderer.

## 8. Migration Strangler Fig

Aucune réécriture totale avant preuve.

### Vertical slice 1 — P0

Migrer le pilote NOVICE-FIRST V2 dans le nouveau moteur déclaratif.

### Vertical slice 2 — Tokenizer Lab

Migrer un laboratoire complexe et vérifier :

- fidélité scientifique ;
- composants réutilisables ;
- persistance ;
- analytics ;
- projection ;
- fonctionnement Web + Electron.

### Gate

Si ces deux slices fonctionnent mieux que les pages legacy, le reste du parcours migre progressivement.

## 9. Definition of Done V3

Un module V3 n'est terminé que si :

- ses outcomes et preuves sont déclarés ;
- ses activités sont testables sans DOM ;
- il a au moins un transfert ;
- les misconceptions ont une remédiation ;
- son état est persistant par port ;
- ses événements d'apprentissage sont émis ;
- ses interactions clavier et projection passent ;
- il fonctionne offline ;
- il passe Web + Electron ;
- son statut pédagogique reflète une preuve terrain réelle.
