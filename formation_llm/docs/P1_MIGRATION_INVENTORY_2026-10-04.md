# P1 Migration Inventory — LATENT V3

Date : 2026-10-04  
Branche : `refactor/latent-v3-p1-migration`  
Base qualifiée : `refactor/latent-v3-tokenizer-slice` @ `4ac43c5c4d80f39272d31ce752630b69eb9605a0`  
Statut : INVENTAIRE ACTIF — P2 RESTE GELÉ

## Décision d'architecture

P1 ne sera pas migré comme une page monolithique. Il est constitué de quatre tranches pédagogiques qui seront qualifiées séparément :

1. **P1S1 — Tokens, représentations et contexte** (`domaine-b.html`)
2. **P1S2 — Transformer et attention** (`domaine-c.html`)
3. **P1S3 — Transformer Block Lab** (`transformer-block-lab.html`)
4. **P1S4 — Sampling Lab** (`sampling-lab.html`)

Chaque tranche doit suivre le patron déjà qualifié par P0 + Tokenizer :

`contrat ECDL → contenu déclaratif → moteur(s) de domaine pur(s) → presenter → renderer générique → ports/adapters → tests unitaires → E2E Web/Electron → Visual & Accessibility Gate`.

Aucune logique métier ou vérité pédagogique ne doit être recopiée dans le DOM.

---

# 1. P1S1 — Tokens, représentations et contexte

## Source V2

`formation_llm/modules/domaine-b.html`

## Objectif actuel

Faire comprendre la chaîne :

`texte → tokens → IDs → vecteurs → budget de contexte`

et empêcher les confusions :

- token ≠ mot ;
- ID ≠ embedding ;
- embedding initial ≠ sens complet ;
- contexte ≠ mémoire applicative.

## Dette pédagogique observée

Le module V2 présente explicitement **12 notions avant manipulation**. Cette structure est incompatible avec le nouveau standard NOVICE-FIRST V2 manipulation-first.

La première phase d'acquisition doit être réordonnée en microcycles :

1. prédire comment un texte sera segmenté ;
2. manipuler le Tokenizer Lab ;
3. seulement ensuite nommer token, vocabulaire, ID et BPE ;
4. manipuler des représentations simples avant d'introduire cosinus et espace vectoriel ;
5. manipuler le budget de contexte avant de formaliser fenêtre de contexte.

## Activités V2 identifiées

- Tokenizer Lab ;
- exemple travaillé texte → tokens → IDs → vecteurs ;
- manipulation embeddings / similarité cosinus ;
- Context Lab / budget de fenêtre ;
- completion ;
- auto-explication ;
- quiz ;
- transfert.

## Réutilisation V3 déjà disponible

### Tokenizer Lab

Le moteur de domaine `tokenizeText()` et l'activité déclarative `content/activities/tokenizer-lab.json` sont déjà qualifiés Web + Electron + mobile + clair/sombre/projection.

**Interdiction :** recopier les règles BPE dans P1S1 ou dans le renderer.

## Nouveaux moteurs de domaine nécessaires

### `representation-engine`

Responsabilités :
- associer un ID pédagogique à un token ;
- distinguer index discret et vecteur ;
- produire/manipuler de petits vecteurs didactiques déterministes ;
- calculer produit scalaire, norme et similarité cosinus ;
- ne jamais interpréter une similarité comme une vérité.

Tests minimaux :
- ID différent ≠ valeur sémantique supérieure ;
- cosinus de vecteurs identiques = 1 ;
- vecteurs orthogonaux = 0 ;
- invariance du cosinus à une multiplication scalaire positive ;
- gestion du vecteur nul explicitement définie.

### `context-budget-engine`

Responsabilités :
- budget total ;
- tokens utilisés ;
- tokens disponibles ;
- overflow ;
- distinction contexte courant / stockage persistant.

Tests minimaux :
- limite exacte ;
- sous-budget ;
- dépassement ;
- espaces/emoji déjà couverts via Tokenizer ;
- aucune assimilation du contexte à une mémoire applicative.

## Activités V3 cibles

- `tokenization-prediction` — prédiction avant vocabulaire ;
- `tokenizer-lab` — activité partagée existante ;
- `token-id-map` — token → ID sans interprétation ordinale ;
- `vector-lab` — vecteurs 2D manipulables ;
- `similarity-lab` — intuition géométrique puis cosinus ;
- `context-budget-lab` — fenêtre et overflow ;
- `self-explanation` ;
- `quiz` ;
- `transfer`.

## Première action cible

Avant ~250 mots visibles, l'élève doit effectuer une prédiction sur la segmentation de plusieurs chaînes (`bonjour`, `extraordinaire`, emoji, espaces), puis observer le tokenizer réel de la simulation.

---

# 2. P1S2 — Transformer et attention

## Source V2

`formation_llm/modules/domaine-c.html`

## Objectif actuel

Expliquer comment une représentation devient contextuelle via :

`Q·K → scaling → masque → softmax → somme pondérée des V`.

## Dette pédagogique observée

Le V2 présente très tôt Q/K/V, la formule complète et plusieurs opérations interdépendantes. Pour un novice, la charge intrinsèque est élevée.

La migration doit démarrer par le problème sémantique :

- « avocat au tribunal » ;
- « avocat avec du citron » ;

puis faire prédire les positions utiles **avant** les termes Query/Key/Value.

## Activités V2 identifiées

- comparaison des deux sens d'« avocat » ;
- Q/K/V ;
- exemple numérique 2D ;
- completion des opérations ;
- Attention Lab ;
- masque causal ;
- misconceptions ;
- quiz ;
- transfert.

## Nouveau moteur de domaine nécessaire

### `attention-engine`

Responsabilités :
- produit scalaire Q·K ;
- scaling par `sqrt(dk)` ;
- masque causal ;
- softmax stable ;
- somme pondérée des V ;
- sortie déterministe pour petits vecteurs didactiques.

Tests minimaux :
- softmax somme à 1 ;
- masquage des positions futures ;
- scaling correct ;
- invariance au décalage constant des logits dans softmax ;
- résultat pondéré correct ;
- aucune interprétation « poids d'attention = explication complète ».

## Activités V3 cibles

- `context-disambiguation-prediction` ;
- `attention-compatibility-lab` ;
- `qkv-role-builder` ;
- `scaled-dot-product-lab` ;
- `causal-mask-lab` ;
- `attention-full-lab` ;
- auto-explication ;
- quiz ;
- transfert.

---

# 3. P1S3 — Transformer Block Lab

## Source V2

`formation_llm/modules/transformer-block-lab.html`

## Objectif actuel

Suivre une représentation dans une architecture causale pré-norm simplifiée :

`Norm → Attention → Résiduel → Norm → MLP → Résiduel`.

Distinguer aussi information de position, empilement et KV cache.

## Dette pédagogique observée

Le module est riche mais cumule plusieurs sous-systèmes : position, normalisation, résidu, MLP, stack et cache. Le risque principal est d'apprendre une recette visuelle plutôt que les responsabilités des briques.

## Activités V2 identifiées

- exemple travaillé d'un bloc ;
- remise dans l'ordre ;
- Position Lab ;
- Block Lab ;
- comparaison Attention / MLP ;
- Stack Lab ;
- KV cache ;
- quiz ;
- transfert.

## Nouveaux moteurs de domaine nécessaires

### `transformer-block-engine`

Responsabilités :
- ordre d'un bloc pré-norm simplifié ;
- mise à jour résiduelle `x + F(x)` ;
- simulation conceptuelle activable/désactivable ;
- distinction attention / MLP.

### `position-engine`

Responsabilités :
- position absolue didactique ;
- rotation RoPE simplifiée déterministe ;
- comparaison ordre différent / mêmes tokens.

### `kv-cache-engine`

Responsabilités :
- coût pédagogique « recalculer » vs « réutiliser K/V passés » ;
- distinction KV cache / mémoire utilisateur / contexte.

Tests minimaux :
- ordre pré-norm canonique de la simulation ;
- résidu correct ;
- position modifie la représentation sans changer l'identité du token ;
- cache ne modifie pas la vérité des sorties ;
- cache ≠ mémoire persistante.

## Activités V3 cibles

- `block-role-prediction` ;
- `position-lab` ;
- `block-builder` ;
- `residual-lab` ;
- `attention-vs-mlp` ;
- `stack-lab` ;
- `kv-cache-lab` ;
- quiz ;
- transfert.

---

# 4. P1S4 — Sampling Lab

## Source V2

`formation_llm/modules/sampling-lab.html`

## Objectif actuel

Expliquer :

`représentation → logits → softmax → filtre → sélection → nouveau contexte`.

Distinguer probabilité locale de continuation et vérité.

## Dette pédagogique observée

Le V2 annonce encore **9 notions avant les curseurs**. La migration doit faire manipuler une distribution minimale de 3 candidats avant d'introduire simultanément greedy, sampling, température, top-k et top-p.

## Activités V2 identifiées

- logits / softmax ;
- exemple manuel à trois candidats ;
- completion ;
- Sampling Lab ;
- température ;
- top-k ;
- top-p ;
- boucle autoregressive ;
- misconceptions ;
- quiz ;
- transfert.

## Nouveau moteur de domaine nécessaire

### `decoding-engine`

Responsabilités :
- softmax stable ;
- température `T > 0` ;
- cas greedy séparé de `T=0` ;
- top-k ;
- top-p / nucleus ;
- renormalisation ;
- tirage pondéré avec RNG injecté pour tests déterministes ;
- boucle autoregressive didactique.

Tests minimaux :
- somme des probabilités = 1 ;
- greedy = argmax ;
- basse température concentre la distribution ;
- haute température l'aplatit ;
- top-k conserve exactement k candidats ;
- top-p conserve le plus petit préfixe atteignant p ;
- renormalisation après filtre ;
- RNG injecté reproductible ;
- probabilité du prochain token ≠ probabilité de vérité.

## Activités V3 cibles

- `next-token-prediction` ;
- `logits-softmax-lab` ;
- `temperature-lab` ;
- `topk-lab` ;
- `topp-lab` ;
- `sampling-lab` ;
- `autoregressive-loop-lab` ;
- quiz ;
- transfert.

---

# 5. Matrice de migration technique

| Élément V2 | V3 cible | État |
| --- | --- | --- |
| HTML pédagogique | JSON ECDL par étape | à créer |
| Tokenizer JS dans page | `tokenizeText()` domaine pur | **qualifié** |
| Tokenizer Lab UI | renderer générique `tokenizer-lab` | **qualifié** |
| Embeddings/cosinus | `representation-engine` | à extraire |
| Contexte | `context-budget-engine` | à extraire |
| Attention | `attention-engine` | à extraire |
| Bloc Transformer | `transformer-block-engine` | à extraire |
| Position/RoPE | `position-engine` | à extraire |
| KV cache | `kv-cache-engine` | à extraire |
| Sampling | `decoding-engine` | à extraire |
| Quiz/transfert | banques déclaratives | à migrer |
| localStorage direct | `ProgressRepository` | patron disponible |
| événements ad hoc | `LearningEventRepository` | patron disponible |
| shell de page | renderer partagé Web/Electron | patron disponible |
| CSS module-specific | composants/styles partagés + exceptions justifiées | à réduire |

---

# 6. Règles de migration

1. **P1S1 est migré en premier.** Le Tokenizer qualifié sert de point d'ancrage.
2. Une activité existante qualifiée doit être **référencée/réutilisée**, jamais copiée.
3. Toute formule ou décision algorithmique doit être dans `src/domain`.
4. Le renderer ne calcule jamais une vérité pédagogique.
5. Une activité doit émettre les événements prévus dans son contrat.
6. Aucun statut `novice-ready` n'est conservé automatiquement : les modules V3 commencent au plus à `design-ready` ou `pilot-ready` selon leur validation.
7. P1S2 ne commence pas avant qualification technique de P1S1.
8. P2 reste gelé jusqu'à qualification complète de P1.

---

# 7. Gates obligatoires pour chaque étape

## Content Gate
- schéma JSON valide ;
- références outcome → evidence → task cohérentes ;
- misconceptions avec remédiation ;
- quiz et transfert présents ;
- première action significative suffisamment précoce.

## Domain Gate
- fonctions pures ;
- aucun DOM / Electron / stockage / fetch ;
- tests numériques et cas frontières.

## Architecture Gate
- adapters dépendent du domaine, jamais l'inverse ;
- aucune duplication des moteurs déjà qualifiés ;
- contenu absent du shell.

## E2E Gate
- Web + Electron ;
- interaction ;
- persistance/rechargement ;
- mêmes résultats de domaine dans les deux shells.

## Visual & Accessibility Gate
- 1360×900 et 390×844 ;
- sombre / clair / projection ;
- focus, clavier, contraste, cibles, overflow, densité ;
- rapport CI conservé.

## Learner Gate
- test terrain novice ;
- explication sans écran ;
- transfert inédit ;
- recueil des blocages et demandes d'aide.

---

# 8. Ordre d'exécution retenu

### Phase P1.1 — Tokens/Contexte
1. étendre le contrat de contenu pour réutiliser une activité partagée ;
2. créer `p1s1.json` ;
3. réutiliser `tokenizer-lab.json` ;
4. extraire `representation-engine` ;
5. extraire `context-budget-engine` ;
6. migrer quiz/transfert ;
7. E2E + Visual/A11y ;
8. learner pilot.

### Phase P1.2 — Attention
Après gate P1S1 vert.

### Phase P1.3 — Bloc Transformer
Après gate P1S2 vert.

### Phase P1.4 — Sampling
Après gate P1S3 vert.

### Gate P1 global
P1 n'est qualifié que lorsque les quatre étapes passent leurs gates et que la navigation inter-étapes, la reprise de session et la réactivation sont cohérentes.

---

# 9. Décision immédiate

La prochaine modification de code doit être **la réutilisation déclarative d'activités partagées dans le schéma V3**, afin que P1S1 puisse consommer `tokenizer-lab.json` sans duplication. Ensuite seulement `p1s1.json` sera créé.
