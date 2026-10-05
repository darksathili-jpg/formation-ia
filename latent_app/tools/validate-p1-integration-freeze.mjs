import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const text = (file) => readFile(path.join(ROOT, file), 'utf8');
const json = async (file) => JSON.parse(await text(file));

function gitBlobSha(buffer) {
  return createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}

const course = await json('content/courses/p1.json');
const gate = await json('content/learner-gates/p1.json');
const expectedSequence = ['p0', 'p1s1', 'p1s2', 'p1s3', 'p1s4'];
const actualSequence = course.moduleSequence?.map((module) => module.id) || [];
if (JSON.stringify(actualSequence) !== JSON.stringify(expectedSequence)) errors.push(`course p1: séquence gelée altérée ${JSON.stringify(actualSequence)}`);
if (course.status !== 'integration-frozen-pending-learner-gate') errors.push('course p1: statut de gel incorrect');
if (course.p2Unlocked !== false) errors.push('course p1: P2 doit rester verrouillé');
if (course.unlockPolicy?.automaticUnlockForbidden !== true) errors.push('course p1: déverrouillage automatique de P2 doit être interdit');
if (course.unlockPolicy?.requiresHumanReview !== true) errors.push('course p1: revue humaine obligatoire absente');
if (course.unlockPolicy?.requiresLearnerGateDecision !== 'eligible-for-human-approval') errors.push('course p1: décision Learner Gate exigée incorrecte');
if (course.learnerGateId !== 'p1') errors.push('course p1: learnerGateId doit rester p1');

if (gate.status !== 'pending-field-evidence') errors.push('Learner Gate: statut doit rester pending-field-evidence avant test terrain');
if (gate.protocol?.minimumParticipants !== 8) errors.push('Learner Gate: minimum de 8 participants attendu');
if (gate.decisionPolicy?.automaticP2UnlockForbidden !== true || gate.decisionPolicy?.humanApprovalRequired !== true) errors.push('Learner Gate: P2 ne doit jamais être déverrouillé automatiquement');
if (gate.privacy?.anonymousByDefault !== true || gate.privacy?.forbidNames !== true || gate.privacy?.localFirst !== true) errors.push('Learner Gate: contrat privacy-first incomplet');
for (const type of ['prediction.submitted', 'manipulation.changed', 'attempt.completed']) if (!gate.meaningfulActionTypes?.includes(type)) errors.push(`Learner Gate: action significative absente ${type}`);

const prerequisites = { p0: [], p1s1: ['p0'], p1s2: ['p1s1'], p1s3: ['p1s2'], p1s4: ['p1s3'] };
const allowedStatuses = { p0: 'pilot-ready', p1s1: 'design-ready', p1s2: 'design-ready', p1s3: 'design-ready', p1s4: 'design-ready' };
for (const id of expectedSequence) {
  const module = await json(`content/modules/${id}.json`);
  if (module.status !== allowedStatuses[id]) errors.push(`${id}: statut ${module.status} inattendu pendant le Learner Gate`);
  if (JSON.stringify(module.audience?.prerequisites || []) !== JSON.stringify(prerequisites[id])) errors.push(`${id}: prérequis de chaîne altérés`);
  if (module.status === 'novice-ready') errors.push(`${id}: novice-ready interdit avant preuve terrain`);
}

for (const [relative, expectedSha] of Object.entries(course.freeze?.gitBlobSha || {})) {
  const absolute = path.join(ROOT, relative);
  try {
    const buffer = await readFile(absolute);
    const actualSha = gitBlobSha(buffer);
    if (actualSha !== expectedSha) errors.push(`freeze: ${relative} modifié (${actualSha} != ${expectedSha})`);
  } catch {
    errors.push(`freeze: fichier absent ${relative}`);
  }
}
if (Object.keys(course.freeze?.gitBlobSha || {}).length < 11) errors.push('freeze: couverture des contrats pédagogiques insuffisante');

const domain = await text('src/domain/analytics/learner-gate.mjs');
for (const forbidden of ['document.', 'window.', 'localStorage', 'sessionStorage', "from 'electron'", 'BrowserWindow', 'fetch(']) if (domain.includes(forbidden)) errors.push(`learner-gate domain: dépendance runtime interdite ${forbidden}`);
for (const marker of ['export function summarizeParticipantModule', 'export function createParticipantPacket', 'export function evaluateLearnerGate']) if (!domain.includes(marker)) errors.push(`learner-gate domain: fonction absente ${marker}`);
if (!domain.includes('p2Unlocked: false')) errors.push('learner-gate domain: invariant P2 verrouillé absent');

const app = await text('src/entrypoints/web/app.mjs');
for (const marker of ["getCourse(INTEGRATED_COURSE_ID)", 'renderCourseNavigation()', "emit('course.navigation'", "gate.href = './learner-gate.html'"]) if (!app.includes(marker)) errors.push(`app: intégration parcours absente ${marker}`);
const html = await text('src/entrypoints/web/index.html');
for (const marker of ['id="courseNav"', 'id="coursePager"', 'id="p2LockState"', 'id="learnerGateLink"']) if (!html.includes(marker)) errors.push(`index: marqueur integration freeze absent ${marker}`);

for (const file of ['src/entrypoints/web/learner-gate.html', 'src/entrypoints/web/learner-gate-app.mjs', 'src/entrypoints/web/learner-gate.css', 'src/adapters/web/local-field-observation-repository.mjs', 'tests/learner-gate.test.mjs', 'tests/p1-integration-e2e.mjs', 'tests/p1-integration-visual-a11y.mjs']) {
  try { await text(file); } catch { errors.push(`Learner Gate: fichier absent ${file}`); }
}
const gateHtml = await text('src/entrypoints/web/learner-gate.html');
for (const marker of ['Aucune identité', 'ne transmet aucune donnée', 'P2 reste verrouillé']) if (!gateHtml.includes(marker)) errors.push(`Learner Gate UI: garde privacy/humain absent ${marker}`);
const gateApp = await text('src/entrypoints/web/learner-gate-app.mjs');
if (!gateApp.includes("EVENT_COURSE_ID = 'latent-llm'")) errors.push('Learner Gate UI: lecture des traces du parcours absente');
if (!gateApp.includes('evaluateLearnerGate({ packets, course, gateConfig })')) errors.push('Learner Gate UI: agrégation cohorte non déléguée au domaine');
if (!gateApp.includes("link.download = `latent-p1-${packet.participantId}.json`")) errors.push('Learner Gate UI: export terrain pseudonyme absent');
const integrationE2E = await text('tests/p1-integration-e2e.mjs');
if (!integrationE2E.includes('runP1IntegrationVisualAccessibilityMatrix')) errors.push('Learner Gate: Visual/A11y matrix non branchée à E2E');

if (errors.length) {
  console.error(`\n❌ P1 INTEGRATION FREEZE INVALIDE\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('✅ P1 Integration Freeze valide — P0→P1S4 gelé, P2 verrouillé, Learner Gate privacy-first, Visual/A11y et décision humaine protégés.');
