# LATENT V3 — Preuve de tranche verticale P0 + Tokenizer

Date : 2026-10-02  
Branche : `refactor/latent-v3-architecture`  
Statut : architecture exécutable, validation technique automatisée ; validation visuelle et terrain encore à réaliser.

## But de cette tranche

Démontrer que V3 apporte un gain d'architecture mesurable, et pas seulement un changement esthétique.

La preuve porte sur deux objets :

1. **P0** doit être rendu depuis un contenu déclaratif et conserver activités, preuves, quiz, transfert, progression et événements ;
2. **Tokenizer Lab** doit devenir un moteur de domaine pur, utilisable et testable sans navigateur.

---

## 1. P0 n'est plus une page pédagogique monolithique

Chaîne de rendu V3 :

```text
p0.json + assessment-banks/p0.json
             │
             ▼
      ContentRepository
             │
             ▼
     module-presenter.mjs
             │
             ▼
       module-renderer.mjs
             │
             ▼
          AppShell
```

Le shell `index.html` ne contient ni le titre pédagogique de P0 ni ses questions.

Le module est décrit par :

- outcomes observables ;
- misconceptions ;
- evidence requirements ;
- activités ;
- sections ;
- politique de maîtrise ;
- statut de validation terrain ;
- références.

Le quiz et les cas de transfert vivent dans une banque séparée, elle aussi validée automatiquement.

### Mesure de duplication

Ancien P0 autonome : `formation_llm/modules/domaine-a.html` ≈ **90 321 octets**.

Nouveau contenu P0 :

- `latent_app/content/modules/p0.json` : **10 320 octets** ;
- `latent_app/content/assessment-banks/p0.json` : **4 679 octets** ;
- total contenu + évaluation : **14 999 octets**.

Ce n'est pas une comparaison de taille d'application complète : le renderer, les styles et les moteurs sont maintenant partagés. C'est précisément le point. Le contenu spécifique P0 représente environ **83 % d'octets en moins** que l'ancienne page monolithique, parce que shell et logique transversale ne sont plus recopiés dans le module.

---

## 2. Les décisions pédagogiques quittent le DOM

Le renderer Web ne décide plus lui-même :

- si une configuration du System Builder est suffisante ;
- si elle est minimale ;
- si l'ordre d'une chaîne est correct ;
- si un choix est juste ;
- quel est le score d'un ensemble de réponses.

Ces règles sont dans `src/domain/activities/decision.mjs`.

Le navigateur ne fait que :

1. recueillir une action ;
2. transmettre les données au domaine ;
3. afficher le résultat ;
4. émettre une trace d'apprentissage.

Cela permet de tester les règles sans Chromium, sans Electron et sans DOM.

---

## 3. Progression et événements passent par des ports

Adapters actuels :

- `FetchContentRepository` ;
- `LocalProgressRepository` ;
- `LocalLearningEventRepository`.

Le domaine ne connaît pas `localStorage`.

Les résultats du quiz et du transfert alimentent `evaluateMastery()`. La maîtrise exige toujours les deux preuves selon la politique du module.

Les interactions importantes génèrent des événements locaux, notamment :

- `module.opened` ;
- `activity.started` ;
- `prediction.submitted` ;
- `manipulation.changed` ;
- `feedback.shown` ;
- `attempt.completed` ;
- `quiz.answered` ;
- `transfer.completed` ;
- `mastery.changed`.

Ces traces sont locales, inspectables et remplaçables par un autre adaptateur sans modifier le domaine.

---

## 4. Tokenizer extrait comme moteur de domaine pur

Fichier : `src/domain/activities/tokenizer.mjs`.

Il ne dépend ni du DOM, ni d'Electron, ni du stockage.

API principale :

```js
tokenizeText(text, {
  mode: 'subword' | 'word' | 'byte',
  contextLimit
})
```

Le résultat expose séparément :

- tokens ;
- type d'unité ;
- nombre de caractères Unicode ;
- octets UTF-8 ;
- nombre de tokens ;
- unités uniques ;
- budget de contexte ;
- dépassement ;
- trace des fusions didactiques BPE.

### Régressions verrouillées

- `extraordinaire` → `extra | ord | inaire` ;
- `modèle` → `mod | èle` ;
- `é` → deux octets UTF-8 `C3 A9` en vue octets ;
- `🚀` est traité comme symbole Unicode et compte quatre octets UTF-8 ;
- deux espaces restent deux unités visibles dans la simulation ;
- un contexte trop court signale explicitement l'overflow sans fausser le nombre réel de tokens ;
- mode ou budget invalides déclenchent une erreur explicite.

---

## 5. Gates automatisés

La CI V3 vérifie désormais quatre niveaux :

1. syntaxe des entrypoints, adapters et moteurs de domaine ;
2. tests unitaires de domaine et contrats d'adapters ;
3. schéma ECDL, références croisées et banques d'évaluation ;
4. **frontières architecturales**.

Le gate architectural interdit notamment au domaine l'accès à :

- `document` ;
- `window` ;
- `localStorage` / `sessionStorage` ;
- Electron / IPC.

Il vérifie également que P0 n'est pas codé dans `index.html`, que le contenu passe par `ContentRepository`, que le renderer délègue les décisions au domaine et que les sécurités Electron restent actives.

---

## 6. Ce que cette tranche prouve déjà

V3 apporte déjà des propriétés que V2 n'avait pas structurellement :

- un contenu P0 auditable indépendamment de l'UI ;
- une banque d'évaluation versionnable ;
- des règles de décision testables sans navigateur ;
- un moteur Tokenizer testable comme bibliothèque ;
- un shell unique ;
- des adapters remplaçables ;
- une validation automatisée des frontières d'architecture ;
- le même renderer utilisable sur Web et Electron.

---

## 7. Ce que cette tranche ne prouve pas encore

Elle ne permet pas encore de déclarer V3 meilleure pédagogiquement auprès des élèves.

Restent obligatoires avant promotion :

1. rendre le Tokenizer V3 avec un adapter UI utilisant réellement le moteur pur ;
2. test navigateur de bout en bout du P0 ;
3. audit visuel desktop/mobile, clair/sombre et projection ;
4. test du package Electron sur Windows ;
5. import de l'état Learning V2 ;
6. nouveau test terrain P0 auprès de novices ;
7. comparaison des blocages, aides demandées, compréhension et transfert avec le premier test.

Le statut P0 reste donc `pilot-ready`.

## Décision

La migration des autres modules reste gelée. La prochaine porte est **Tokenizer UI V3 + E2E P0**, puis test terrain. Si cette tranche échoue à améliorer la compréhension ou augmente les défauts techniques, l'architecture doit être corrigée avant toute généralisation.
