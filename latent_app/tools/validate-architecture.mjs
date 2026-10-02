import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

async function text(relative) {
  return readFile(path.join(ROOT, relative), 'utf8');
}

const domainFiles = [
  'src/domain/activities/tokenizer.mjs',
  'src/domain/activities/decision.mjs',
  'src/domain/learning/mastery.mjs',
  'src/domain/analytics/learning-event.mjs'
];

const forbiddenDomainTokens = [
  'document.', 'window.', 'localStorage', 'sessionStorage', "from 'electron'", 'ipcRenderer', 'BrowserWindow'
];

for (const file of domainFiles) {
  const source = await text(file);
  for (const token of forbiddenDomainTokens) {
    if (source.includes(token)) errors.push(`${file}: dépendance runtime interdite détectée: ${token}`);
  }
}

const index = await text('src/entrypoints/web/index.html');
const app = await text('src/entrypoints/web/app.mjs');
const tokenizerHtml = await text('src/entrypoints/web/tokenizer.html');
const tokenizerApp = await text('src/entrypoints/web/tokenizer-app.mjs');
const renderer = await text('src/adapters/web/module-renderer.mjs');
const presenter = await text('src/application/module-presenter.mjs');
const contentRepository = await text('src/adapters/web/fetch-content-repository.mjs');
const electron = await text('src/entrypoints/electron/main.mjs');
const packageJson = await text('package.json');
const e2e = await text('tests/e2e-smoke.mjs');

if (index.includes('Comprendre ce qui se cache derrière un assistant IA')) {
  errors.push('index.html: contenu pédagogique P0 encore codé dans le shell');
}
if (!index.includes('id="moduleRoot"')) errors.push('index.html: host déclaratif moduleRoot absent');
if (!app.includes('new FetchContentRepository')) errors.push('app.mjs: ContentRepository non utilisé');
if (/fetch\s*\(/.test(app)) errors.push('app.mjs: accès HTTP direct détecté, utiliser ContentRepository');
if (!app.includes('buildModuleViewModel')) errors.push('app.mjs: presenter applicatif non utilisé');

if (!renderer.includes("from '../../domain/activities/decision.mjs'")) errors.push('renderer: décisions métier non déléguées au domaine');
if (!renderer.includes("from '../../domain/activities/tokenizer.mjs'")) errors.push('renderer: Tokenizer Lab non branché sur le domaine tokenizer');
if (!renderer.includes('tokenizeText(')) errors.push('renderer: Tokenizer Lab ne consomme pas tokenizeText');
for (const forbidden of ['TextEncoder', 'DIDACTIC_BPE_MERGES', 'applyRankedMerges(', 'splitText(']) {
  if (renderer.includes(forbidden)) errors.push(`renderer: logique tokenizer dupliquée détectée: ${forbidden}`);
}
const answerOnLeft = /\.answer\b\s*(?:===|==|!==|!=)/;
const answerOnRight = /(?:===|==|!==|!=)\s*[A-Za-z_$][\w$]*(?:\?\.)?(?:\.[A-Za-z_$][\w$]*)*\.answer\b/;
if (answerOnLeft.test(renderer) || answerOnRight.test(renderer)) {
  errors.push('renderer: comparaison directe à answer détectée, scoring doit rester dans le domaine');
}
if (!renderer.includes('evaluateComponentMission(') || !renderer.includes('evaluateOrder(') || !renderer.includes('scoreChoiceSet(')) {
  errors.push('renderer: un moteur de décision de domaine attendu n’est pas utilisé');
}
if (!renderer.includes("dataset.renderedFrom = 'declarative-content'")) {
  errors.push('renderer: preuve de rendu déclaratif absente');
}

if (!tokenizerHtml.includes('id="tokenizerRoot"')) errors.push('tokenizer.html: host Tokenizer Lab absent');
if (!tokenizerApp.includes('new FetchContentRepository')) errors.push('tokenizer-app.mjs: ContentRepository non utilisé');
if (!tokenizerApp.includes("getActivity(ACTIVITY_ID)")) errors.push('tokenizer-app.mjs: activité autonome non chargée par le port');
if (/fetch\s*\(/.test(tokenizerApp)) errors.push('tokenizer-app.mjs: accès HTTP direct détecté');
if (tokenizerApp.includes('tokenizeText(') || tokenizerApp.includes('TextEncoder')) {
  errors.push('tokenizer-app.mjs: logique de tokenisation interdite dans l’entrypoint');
}
if (!contentRepository.includes('activities/${activityId}.json')) errors.push('ContentRepository: activités autonomes non prises en charge');

if (presenter.includes('document.') || presenter.includes('window.')) errors.push('module-presenter: dépendance DOM interdite');
if (!electron.includes("APP_ROOT = path.resolve(__dirname, '../../..')")) errors.push('Electron: protocole ne sert pas tout latent_app');
if (!electron.includes('nodeIntegration: false') || !electron.includes('contextIsolation: true') || !electron.includes('sandbox: true')) {
  errors.push('Electron: garde-fous de sécurité incomplets');
}
if (!packageJson.includes('"test:e2e"')) errors.push('package.json: gate E2E absent');
if (!e2e.includes("smokeP0") || !e2e.includes("smokeTokenizer") || !e2e.includes("createWindow")) {
  errors.push('tests/e2e-smoke.mjs: couverture Web/Electron P0 + Tokenizer incomplète');
}

if (errors.length) {
  console.error(`\n❌ ARCHITECTURE LATENT V3 INVALIDE\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('✅ Architecture LATENT V3 valide — domaine sans runtime, P0 déclaratif, Tokenizer Lab sans logique DOM, contenu via ports, décisions hors UI, Electron isolé et gate E2E présent.');
