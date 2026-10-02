# LATENT V3 — Application autonome de formation

Statut : architecture sandbox / tranche verticale 1  
Branche : `refactor/latent-v3-architecture`

Ce répertoire est la nouvelle application LATENT. Il ne remplace pas encore `formation_llm/`.

## Principes

- **ECDL** pour la conception pédagogique ;
- **architecture hexagonale / Ports & Adapters** pour le logiciel ;
- **monolithe modulaire** plutôt que microservices ;
- **renderer Web standard** ;
- Electron = adaptateur desktop, pas cœur métier ;
- migration progressive **Strangler Fig** ;
- contenu pédagogique déclaratif ;
- état et événements accessibles uniquement via des ports ;
- offline-first ;
- aucune API distante obligatoire.

## Arborescence

```text
latent_app/
├─ content/                 # contenu déclaratif versionné
│  ├─ schema/
│  └─ modules/
├─ src/
│  ├─ domain/               # règles pures, aucune dépendance UI/Electron
│  ├─ application/          # use cases + ports
│  ├─ adapters/             # IndexedDB, Electron, mémoire, legacy
│  └─ entrypoints/
│     ├─ web/               # même renderer pour navigateur et Electron
│     └─ electron/          # main/preload sécurisés
├─ tests/
└─ tools/
```

## Tranche verticale initiale

1. shell Web/Electron ;
2. ports de persistance ;
3. modèle de maîtrise pur ;
4. module P0 déclaratif minimal ;
5. événements d'apprentissage ;
6. migration du Tokenizer Lab ;
7. import de l'ancien état `formation-llm-learning-v2`.

Le but est de prouver l'architecture avec P0 + Tokenizer avant de migrer les autres modules.

## Développement

```bash
cd latent_app
npm install
npm test
npm start
```

Pour créer un livrable desktop :

```bash
npm run make
```

## Sécurité Electron

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- protocole `latent://`
- CSP restrictive
- navigation externe bloquée par défaut
- preload minimal
- IPC en liste blanche et validation de l'origine

## Important

Ce dossier est une **architecture sandbox**. Tant que P0 et Tokenizer n'ont pas atteint les gates fonctionnels, pédagogiques et visuels, `formation_llm/` reste l'application utilisateur de référence.
