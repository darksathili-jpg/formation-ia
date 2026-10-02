# LATENT V3 — Architecture cible ECDL + Hexagonale

Version : 0.1  
Date : 2026-10-02  
Statut : Architecture Decision Record de référence

## 1. But

Construire une application autonome de formation à l'IA qui reste :

- scientifiquement traçable ;
- utilisable par un vrai novice ;
- manipulable et mesurable ;
- totalement exploitable hors ligne ;
- distribuable en application desktop ;
- utilisable également sur le Web ;
- testable sans dépendre d'une UI ou d'un stockage particulier.

Le cœur du produit n'est pas « une collection de pages ». Le cœur est un **moteur d'apprentissage piloté par des preuves** auquel plusieurs interfaces peuvent se connecter.

---

## 2. Deux architectures superposées

### 2.1 Architecture pédagogique : Evidence-Centered Design for Learning

Chaque unité d'apprentissage est spécifiée par quatre modèles.

#### A. Competency model

Décrit ce qui doit changer chez l'apprenant.

```text
Competency
├─ outcome
├─ prerequisites[]
├─ vocabulary[]
├─ misconceptions[]
├─ proficiencyLevels[]
└─ transferTargets[]
```

#### B. Evidence model

Décrit les observations acceptées comme preuve.

```text
EvidenceRequirement
├─ competencyId
├─ claim                # ce que l'on veut pouvoir conclure
├─ observable           # comportement observable
├─ rubric
├─ minimumEvidence
├─ invalidEvidence[]    # ex. reconnaissance seule
└─ confidencePolicy
```

#### C. Task model

Décrit les tâches capables de faire émerger cette preuve.

```text
LearningTask
├─ prompt / situation
├─ interactionType
├─ expectedActions[]
├─ observableEvents[]
├─ successCriteria[]
├─ misconceptionsTriggered[]
└─ transferDistance
```

#### D. Pedagogical model

Décrit comment aider sans faire à la place de l'apprenant.

```text
PedagogicalStrategy
├─ microcycles[]
├─ scaffolds[]
├─ hints[]
├─ feedbackRules[]
├─ fadingRules[]
├─ remediationRoutes[]
└─ reviewPolicy
```

### 2.2 Microcycle LATENT V2/V3

Un microcycle conserve la règle :

`prédire → manipuler → observer → nommer → expliquer → refaire autrement`

Mais V3 l'encode comme donnée afin de pouvoir :

- vérifier automatiquement qu'une manipulation existe ;
- mesurer le temps avant la première action ;
- comparer plusieurs variantes pédagogiques ;
- réutiliser le même moteur dans Web et Electron ;
- analyser les traces d'apprentissage.

---

## 3. Architecture logicielle : monolithe modulaire hexagonal

### 3.1 Règle de dépendance

```text
UI / Electron / IndexedDB / fichiers / Web
                 │
             adapters
                 │
               ports
                 │
         application use-cases
                 │
              domain
```

Aucune dépendance du domaine vers Electron, le DOM, IndexedDB ou localStorage.

### 3.2 Bounded contexts

#### Curriculum

Responsabilités :
- graphe de compétences ;
- parcours ;
- modules ;
- sources ;
- versions de contenu ;
- prérequis.

#### Learning

Responsabilités :
- progression ;
- état d'étayage ;
- maîtrise ;
- misconceptions ;
- remédiation ;
- répétition espacée.

#### Activities

Responsabilités :
- exécution des labs ;
- modèle d'état d'une activité ;
- commandes de l'apprenant ;
- conséquences observables ;
- feedback.

Un lab doit pouvoir être testé comme une fonction/automate sans navigateur.

#### Assessment

Responsabilités :
- items ;
- rubrics ;
- preuves ;
- transfert ;
- décision de maîtrise ;
- qualité du grader.

#### Analytics

Responsabilités :
- journal d'événements ;
- métriques terrain ;
- export anonymisable ;
- tableaux formateur locaux.

#### Runtime

Responsabilités :
- import/export ;
- environnement Web ou desktop ;
- ouverture contrôlée de liens ;
- mise à jour ;
- version de l'application.

---

## 4. Ports

Les ports sont des contrats stables, sans technologie.

### ContentRepository

```js
getCourse(courseId)
getModule(moduleId)
getActivity(activityId)
listModules()
getVersion()
```

### ProgressRepository

```js
loadLearnerState(profileId)
saveLearnerState(profileId, state)
resetLearnerState(profileId)
```

### LearningEventRepository

```js
append(event)
query(filter)
export(filter)
```

### Clock

```js
now()
```

Permet de tester la répétition espacée sans dépendre de l'heure machine.

### ImportExportPort

```js
exportLearningPackage(payload)
importLearningPackage()
```

### ExternalLinkPort

```js
openTrustedUrl(url)
```

### UpdatePort

```js
getCurrentVersion()
checkForUpdate()
```

---

## 5. Modèle d'événement d'apprentissage

Format interne inspiré des standards d'analytics éducatifs, mais autonome.

```json
{
  "id": "uuid",
  "at": "2026-10-02T08:00:00.000Z",
  "profileId": "local-profile",
  "sessionId": "uuid",
  "courseId": "llm-foundations",
  "moduleId": "p0",
  "activityId": "p0-capability-origin",
  "type": "prediction.submitted",
  "payload": {
    "itemId": "current-document",
    "answer": "model",
    "correct": false
  },
  "contentVersion": "3.0.0-alpha.1",
  "appVersion": "0.1.0"
}
```

Types initiaux :

- `module.opened`
- `activity.started`
- `prediction.submitted`
- `manipulation.changed`
- `feedback.shown`
- `hint.requested`
- `attempt.completed`
- `explanation.self_checked`
- `quiz.answered`
- `transfer.completed`
- `mastery.changed`
- `review.completed`

Règle : collecter uniquement ce qui sert à apprendre ou à améliorer la formation. Pas de télémétrie cachée ; export local transparent.

---

## 6. Modèle de contenu déclaratif

Un module ne contient plus de shell HTML complet.

```text
module.json
├─ metadata
├─ outcomes[]
├─ misconceptions[]
├─ evidence[]
├─ sections[]
│  └─ activities[]
├─ assessments
├─ transfer
├─ remediation
├─ references[]
└─ pedagogyStatus
```

Les activités utilisent des types réutilisables :

- `prediction-cards`
- `component-builder`
- `rank-order`
- `parameter-lab`
- `tokenizer-lab`
- `vector-lab`
- `attention-lab`
- `retrieval-lab`
- `evidence-lab`
- `eval-lab`
- `worked-example`
- `self-explanation`
- `quiz`
- `transfer-cards`

Les types spécifiques complexes disposent d'un moteur de domaine séparé.

---

## 7. Shell UI unique

La nouvelle application possède un seul shell :

```text
AppShell
├─ SideNavigation
├─ CourseHeader
├─ LearnerProgress
├─ ModuleRenderer
├─ TrainerPanel
├─ ProjectionMode
├─ ReviewQueue
└─ AccessibilityControls
```

Les styles de thème, projection, header, responsive et accessibilité n'existent qu'une seule fois.

Conséquence recherchée : corriger un header une fois corrige tous les modules.

---

## 8. Rendu multi-runtime

### Web adapter

- ES modules ;
- IndexedDB ;
- service worker à terme ;
- GitHub Pages conservé durant la migration.

### Electron adapter

- même renderer ;
- protocole `latent://` ;
- `contextIsolation: true` ;
- `sandbox: true` ;
- `nodeIntegration: false` ;
- preload limité à des commandes explicitement autorisées ;
- aucun accès direct `fs` depuis l'UI.

Electron ne contient aucune règle pédagogique.

---

## 9. Stratégie de persistance

### Phase 1

IndexedDB constitue l'adaptateur de référence Web et desktop pour limiter les divergences.

### Phase 2

Si les besoins formateur l'exigent, un adaptateur desktop durable peut utiliser une base locale ou des fichiers structurés, sans toucher au domaine.

La base de données n'est donc pas une décision d'architecture irréversible.

### Migration localStorage

Un `LegacyProgressImporter` lit une fois `formation-llm-learning-v2`, transforme l'état vers V3 puis conserve une trace de migration. Aucune perte silencieuse.

---

## 10. Tests

### Pyramide minimale

1. **domain unit tests** — mastery, review, prerequisites, labs ;
2. **contract tests** — chaque adaptateur respecte son port ;
3. **content schema tests** — contenu valide et cohérent ;
4. **component tests** — interaction/feedback ;
5. **E2E critical paths** — P0, Tokenizer, maîtrise, reprise de session ;
6. **visual regression** — desktop/mobile/dark/projection ;
7. **field evidence** — test humain novice.

Aucune CI ne peut promouvoir seule un module en `novice-ready`.

---

## 11. Statuts de contenu

- `draft`
- `design-ready`
- `pilot-ready`
- `novice-ready`
- `needs-remediation`
- `retired`

Chaque promotion est accompagnée d'une preuve :

```text
design-ready   -> validation scientifique + structurelle
pilot-ready    -> tests techniques + garde-fous pédagogiques
novice-ready   -> validation terrain documentée
```

---

## 12. Parcours cible à trois profondeurs

Le graphe de compétences peut être présenté de trois manières :

### Découvrir

Sans prérequis, manipulation et intuition. Public lycée/formateur débutant.

### Pratiquer

Cas professionnels, prompts, évaluation, RAG, outils et mini-projets.

### Approfondir

Mathématiques, entraînement, optimisation, architectures, fine-tuning, inference et déploiement.

Ce ne sont pas trois bases de contenus : ce sont trois parcours de sélection et d'étayage sur le même référentiel.

---

## 13. Première tranche verticale

La preuve d'architecture doit migrer seulement :

1. P0 manipulation-first ;
2. Tokenizer Lab ;
3. progression locale ;
4. événements ;
5. Web + Electron.

La migration générale commence uniquement après validation de cette tranche.
