# P1 Field Trial Readiness + Session Pack — LATENT V3

Date : 2026-10-05  
Branche : `refactor/latent-v3-p1-field-trial-pack`  
Statut : **prêt pour expérimentation terrain — P2 reste verrouillé**

## 1. Objectif du pack

Ce pack transforme le **P1 Integration Freeze + Learner Gate** en protocole de séance réellement exploitable avec des élèves. Il ne cherche plus à démontrer que l'application fonctionne : cette partie est déjà couverte par les tests techniques. Il cherche à produire des preuves sur quatre questions pédagogiques :

1. l'élève agit-il rapidement sans recevoir l'explication à l'avance ?
2. comprend-il causalement ce qu'il a manipulé ?
3. transfère-t-il la notion à une situation nouvelle ?
4. conserve-t-il cette compréhension après un délai de 24 h à 7 jours ?

Le parcours testé reste strictement :

`P0 → P1S1 → P1S2 → P1S3 → P1S4 → Learner Gate`

Aucune ouverture de P2 n'est autorisée automatiquement.

---

# 2. Fiche enseignant — conduite de séance

## 2.1 Avant la séance

Préparer idéalement **8 à 10 élèves**. Le minimum de décision du Learner Gate reste fixé à 8 participants.

Checklist :

- un poste par élève ou un profil navigateur distinct ;
- application LATENT V3 ouverte sur P0 ;
- stockage local autorisé ;
- aucune identité saisie dans l'application ;
- code pseudonyme `P-XXXXXXXX` visible dans le Learner Gate ;
- grilles d'observation imprimées ;
- scénarios de transfert différé conservés par l'enseignant et **non communiqués à l'avance** ;
- enseignant informé de la règle d'intervention ci-dessous.

## 2.2 Règle d'intervention de l'enseignant

### Intervention autorisée — clarification

Exemples :

- reformuler une consigne sans donner la solution ;
- expliquer le sens d'un mot courant ;
- indiquer où cliquer si l'élève ne trouve pas un contrôle ;
- résoudre un problème purement technique.

Cette aide ne compte pas comme aide conceptuelle directe.

### Intervention à enregistrer — aide conceptuelle

Exemples :

- expliquer ce qu'est un token avant que l'élève ne le découvre ;
- dire quels mots doivent recevoir de l'attention ;
- rappeler le rôle du résiduel ;
- expliquer comment la température modifie les probabilités ;
- dire explicitement quelle réponse choisir.

Toute intervention de ce type **avant la première manipulation significative** doit être enregistrée comme `aide conceptuelle directe = oui`.

## 2.3 Déroulé recommandé

Le parcours n'a pas à être terminé en une séance.

### Séance A — environ 55 à 70 min

- 5 min : consignes élèves et pseudonymat ;
- P0 ;
- P1S1 ;
- explication sans écran après chacun des deux modules.

### Séance B — environ 55 à 70 min

- P1S2 ;
- P1S3 ;
- explication sans écran après chaque module.

### Séance C — environ 35 à 50 min

- P1S4 ;
- explication sans écran ;
- vérification du Learner Gate local ;
- export du paquet terrain JSON.

### Séance différée — 24 h à 7 jours plus tard

- 15 à 25 min ;
- cinq scénarios de transfert nouveaux ;
- aucune révision juste avant ;
- aucune solution rappelée ;
- résultat binaire `réussi / non réussi` pour chaque module, accompagné d'une courte note factuelle si nécessaire.

---

# 3. Consignes élèves — à lire ou distribuer

> Vous testez une nouvelle version d'une formation sur le fonctionnement des IA génératives. Ce n'est pas une évaluation notée.
>
> Travaillez dans l'ordre proposé. Avant de demander de l'aide, essayez de comprendre la situation, faites une prédiction et utilisez les manipulations disponibles.
>
> Si une consigne n'est pas claire, vous pouvez demander une reformulation. L'enseignant ne vous donnera pas l'explication conceptuelle avant votre première tentative.
>
> Certaines réponses fausses sont normales et utiles : le but est d'observer ce que vous comprenez grâce aux manipulations et aux feedbacks.
>
> Ne saisissez ni votre nom, ni votre prénom, ni votre identifiant scolaire. Le poste utilise uniquement un code pseudonyme `P-…`.
>
> À la fin de certains modules, on vous demandera de masquer l'écran et d'expliquer avec vos propres mots ce que vous avez compris.

---

# 4. Grille d'observation imprimable — un exemplaire par élève

Code pseudonyme : `P-________________`  
Date(s) : ______________________________  
Observateur : __________________________ (initiales uniquement si nécessaire)

| Module | Heure début | 1re action significative | Aide conceptuelle avant action ? | Explication sans écran 0–2 | Misconception critique persistante ? | Blocage max | Transfert différé |
|---|---|---|---|---:|---|---|---|
| P0 | ____ | ____ | □ non □ oui | 0 / 1 / 2 | □ non □ oui | aucun / mineur / majeur | □ réussi □ non |
| P1S1 | ____ | ____ | □ non □ oui | 0 / 1 / 2 | □ non □ oui | aucun / mineur / majeur | □ réussi □ non |
| P1S2 | ____ | ____ | □ non □ oui | 0 / 1 / 2 | □ non □ oui | aucun / mineur / majeur | □ réussi □ non |
| P1S3 | ____ | ____ | □ non □ oui | 0 / 1 / 2 | □ non □ oui | aucun / mineur / majeur | □ réussi □ non |
| P1S4 | ____ | ____ | □ non □ oui | 0 / 1 / 2 | □ non □ oui | aucun / mineur / majeur | □ réussi □ non |

### Barème « explication sans écran »

- **0** : l'élève ne peut pas expliquer le mécanisme ou produit une explication incompatible avec l'activité ;
- **1** : l'élève décrit une partie du mécanisme mais sans chaîne causale claire, ou oublie une distinction essentielle ;
- **2** : l'élève explique correctement le mécanisme, relie cause et effet et formule au moins une limite ou distinction importante.

### Notes factuelles

P0 : ______________________________________________________________________

P1S1 : ____________________________________________________________________

P1S2 : ____________________________________________________________________

P1S3 : ____________________________________________________________________

P1S4 : ____________________________________________________________________

Ne jamais noter d'information personnelle, médicale, familiale ou scolaire identifiante.

---

# 5. Scénarios de transfert différé — garder cachés jusqu'au test

Les cinq scénarios ci-dessous doivent être proposés **24 h à 7 jours** après l'apprentissage. Ils ne reprennent pas mot pour mot les exemples de la formation.

## 5.1 P0 — D'où vient réellement la capacité ?

### Carte élève

Une assistante doit répondre à la demande suivante :

> « Le règlement du concours municipal a-t-il été modifié cette semaine ? Si oui, résume la modification puis ajoute-moi un rappel jeudi à 17 h. »

Explique :

1. ce que peut faire le modèle de langage seul ;
2. quel composant externe est nécessaire pour connaître une modification publiée cette semaine ;
3. quel composant est nécessaire pour créer réellement le rappel ;
4. pourquoi une réponse très convaincante du modèle ne suffit pas à prouver que l'information est à jour.

### Critère de réussite observateur

Réussi si l'élève distingue clairement :

- génération linguistique du modèle ;
- accès à une source externe actuelle / retrieval ;
- action via un outil ou service de calendrier ;
- absence de garantie de fraîcheur ou de vérité par le seul style de réponse.

Échec si l'élève attribue au LLM seul l'accès garanti à l'information actuelle ou l'exécution réelle du rappel.

---

## 5.2 P1S1 — Tokens, représentation et fenêtre de contexte

### Carte élève

Un système reçoit le texte :

> `RDV café ☕ à 14 h — dossier final`

Son tokenizer indique **11 tokens** pour cette entrée. La fenêtre restante n'accepte que **9 tokens**.

Explique :

1. pourquoi on ne peut pas déduire le nombre de tokens simplement en comptant les mots ou les caractères ;
2. combien de tokens dépassent la fenêtre disponible ;
3. pourquoi le fait que `é` ou `☕` occupent plusieurs octets UTF-8 ne permet pas de déduire directement leur nombre de tokens ;
4. ce que signifie concrètement une fenêtre de contexte finie pour les informations placées hors budget.

### Critère de réussite observateur

Réussi si l'élève :

- distingue mots, caractères, octets et tokens ;
- calcule un overflow de 2 tokens ;
- comprend que les octets UTF-8 et les tokens sont deux représentations différentes ;
- explique que le modèle ne dispose pas de tout ce qui dépasse la fenêtre effectivement fournie.

---

## 5.3 P1S2 — Attention et contexte

### Carte élève

Compare :

> « La grue soulève la poutre près du chantier. »

et

> « La grue migre au-dessus du marais. »

Pour le mot **grue**, indique quels éléments du contexte peuvent aider à construire une représentation différente dans les deux phrases.

Puis réponds :

1. pourquoi des poids d'attention élevés vers `poutre` / `chantier` ou `migre` / `marais` peuvent être utiles ;
2. pourquoi un poids d'attention élevé n'est pas une preuve de vérité ;
3. lors de la génération token par token, pourquoi un masque causal interdit-il de regarder des positions futures ?

### Critère de réussite observateur

Réussi si l'élève relie correctement contextualisation et indices de la phrase, refuse l'équivalence `attention = vérité` et explique le rôle causal du masque lors de la prédiction du prochain token.

---

## 5.4 P1S3 — Bloc Transformer, position et KV cache

### Carte élève

Un modèle a déjà traité 120 tokens d'un prompt et doit maintenant produire le 121e.

Explique :

1. pourquoi le modèle doit disposer d'une information de position en plus de l'identité des tokens ;
2. ce que permet la connexion résiduelle autour d'une sous-couche ;
3. ce que le KV cache peut réutiliser lorsqu'un nouveau token est généré ;
4. pourquoi le KV cache n'est ni une mémoire personnelle durable de l'utilisateur ni une modification des poids du modèle.

### Critère de réussite observateur

Réussi si l'élève distingue :

- contenu du token et position ;
- transformation de sous-couche et chemin résiduel ;
- réutilisation de clés/valeurs déjà calculées pour les positions précédentes ;
- cache d'inférence temporaire, mémoire utilisateur et paramètres entraînés.

---

## 5.5 P1S4 — Décodage et décision

### Carte élève

Pour le prochain token, un modèle produit trois candidats :

| Token | Probabilité après softmax |
|---|---:|
| `probable` | 0,49 |
| `certain` | 0,40 |
| `inconnu` | 0,11 |

Réponds :

1. quel token choisit une stratégie **greedy** ;
2. quels candidats restent avec **top-k = 2** ;
3. quels candidats suffisent pour atteindre **top-p = 0,75** en les prenant du plus probable au moins probable ;
4. ce qu'une température plus basse ferait en général à la distribution ;
5. pourquoi rendre `probable` encore plus dominant ne prouve pas que ce token est factuellement correct ;
6. ce qui se passe après le choix du token dans une boucle autorégressive.

### Critère de réussite observateur

Réussi si l'élève répond :

- greedy → `probable` ;
- top-k 2 → `probable` + `certain` ;
- top-p 0,75 → `probable` + `certain` (cumul 0,89) ;
- température plus basse → distribution généralement plus concentrée ;
- confiance/probabilité de décodage ≠ vérité ;
- le token choisi est ajouté au contexte puis une nouvelle distribution est calculée pour l'étape suivante.

---

# 6. Fiche d'analyse de cohorte

Cohorte : ______ participants valides  
Date d'analyse : ____________________

## 6.1 Seuils du Learner Gate

| Indicateur | Seuil produit | Résultat cohorte | Statut |
|---|---:|---:|---|
| Participants | ≥ 8 | ____ | □ OK □ non |
| Parcours complet | ≥ 75 % | ____ | □ OK □ non |
| Complétion de chaque module | ≥ 75 % | ____ | □ OK □ non |
| Temps médian avant 1re action | ≤ 180 s | ____ | □ OK □ non |
| Aide conceptuelle directe | ≤ 25 % | ____ | □ OK □ non |
| Quiz médian | ≥ 75 % | ____ | □ OK □ non |
| Transfert immédiat médian | ≥ 70 % | ____ | □ OK □ non |
| Maîtrise | ≥ 65 % | ____ | □ OK □ non |
| Explication sans écran | ≥ 1,5 / 2 | ____ | □ OK □ non |
| Transfert différé réussi | ≥ 70 % | ____ | □ OK □ non |
| Misconception critique persistante | ≤ 25 % | ____ | □ OK □ non |
| Blocage majeur | 0 | ____ | □ OK □ non |

## 6.2 Diagnostic par module

| Module | Ce qui fonctionne | Blocage dominant | Misconception dominante | Preuve de transfert | Action décidée |
|---|---|---|---|---|---|
| P0 | | | | | |
| P1S1 | | | | | |
| P1S2 | | | | | |
| P1S3 | | | | | |
| P1S4 | | | | | |

## 6.3 Décision humaine

Décision du moteur :

□ `pending-field-evidence`  
□ `revise-before-p2`  
□ `eligible-for-human-approval`

Décision humaine :

□ poursuivre la collecte ;
□ corriger P1 puis retester ;
□ autoriser la préparation de P2 ;
□ autre : ____________________________________________

Justification factuelle :

____________________________________________________________________________

____________________________________________________________________________

Signature / initiales de la revue : ____________________

**Rappel : aucune métrique, même parfaite, ne déverrouille P2 automatiquement.**

---

# 7. Critères de readiness avant première utilisation réelle

Le Field Trial peut commencer seulement si :

- la CI V3 reste verte ;
- les cinq modules restent sur leurs versions gelées ;
- le Learner Gate est accessible en Web et Electron ;
- le pack imprimable est accessible depuis le Learner Gate ;
- l'impression A4 ne dépend d'aucun fond coloré ;
- les cinq scénarios différés sont présents et distincts des exemples d'entraînement ;
- aucun champ du pack ne demande nom, prénom ou identifiant scolaire ;
- P2 est toujours verrouillé.

Le prochain jalon après cette tranche n'est **pas** la conception de P2 : c'est l'exécution du protocole avec de vrais élèves et l'analyse de la cohorte.