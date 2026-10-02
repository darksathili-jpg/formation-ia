import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(await readFile(path.join(ROOT, 'content/schema/module.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const moduleDir = path.join(ROOT, 'content/modules');
const files = (await readdir(moduleDir)).filter((name) => name.endsWith('.json')).sort();
const errors = [];

function unique(values) {
  return new Set(values).size === values.length;
}

for (const file of files) {
  const full = path.join(moduleDir, file);
  const module = JSON.parse(await readFile(full, 'utf8'));

  if (!validate(module)) {
    for (const error of validate.errors || []) {
      errors.push(`${file}${error.instancePath || '/'} ${error.message}`);
    }
    continue;
  }

  const outcomeIds = module.outcomes.map((x) => x.id);
  const evidenceIds = module.evidence.map((x) => x.id);
  const activityIds = module.activities.map((x) => x.id);
  const sectionIds = module.sections.map((x) => x.id);

  if (!unique(outcomeIds)) errors.push(`${file}: outcome IDs dupliqués`);
  if (!unique(evidenceIds)) errors.push(`${file}: evidence IDs dupliqués`);
  if (!unique(activityIds)) errors.push(`${file}: activity IDs dupliqués`);
  if (!unique(sectionIds)) errors.push(`${file}: section IDs dupliqués`);

  const outcomes = new Set(outcomeIds);
  const evidence = new Set(evidenceIds);
  const activities = new Set(activityIds);

  for (const item of module.evidence) {
    if (!outcomes.has(item.outcomeId)) errors.push(`${file}: evidence ${item.id} référence un outcome absent: ${item.outcomeId}`);
    for (const taskId of item.taskIds) {
      if (!activities.has(taskId)) errors.push(`${file}: evidence ${item.id} référence une tâche absente: ${taskId}`);
    }
  }

  for (const activity of module.activities) {
    for (const evidenceId of activity.evidenceIds) {
      if (!evidence.has(evidenceId)) errors.push(`${file}: activity ${activity.id} référence une evidence absente: ${evidenceId}`);
    }
  }

  for (const section of module.sections) {
    for (const activityId of section.activityIds) {
      if (!activities.has(activityId)) errors.push(`${file}: section ${section.id} référence une activité absente: ${activityId}`);
    }
  }

  if (!activities.has(module.assessment.quizActivityId)) errors.push(`${file}: quizActivityId absent`);
  if (!activities.has(module.assessment.transferActivityId)) errors.push(`${file}: transferActivityId absent`);

  for (const outcome of module.outcomes) {
    for (const misconception of outcome.misconceptions) {
      if (!activities.has(misconception.remediationActivityId)) {
        errors.push(`${file}: misconception ${misconception.id} sans activité de remédiation valide`);
      }
    }
  }

  const field = module.pedagogy?.fieldValidation;
  if (module.status === 'novice-ready' && field?.status !== 'passed') {
    errors.push(`${file}: novice-ready interdit sans validation terrain passée`);
  }
  if (module.status === 'pilot-ready' && !['pending', 'passed'].includes(field?.status)) {
    errors.push(`${file}: pilot-ready exige une validation terrain pending ou passed`);
  }

  const manipulationTypes = new Set([
    'prediction-cards', 'component-builder', 'rank-order', 'completion', 'tokenizer-lab',
    'vector-lab', 'parameter-lab', 'attention-lab', 'retrieval-lab', 'evidence-lab', 'eval-lab'
  ]);
  const manipulationCount = module.activities.filter((activity) => manipulationTypes.has(activity.type)).length;
  const minimum = module.pedagogy?.minimumMeaningfulManipulations || 0;
  if (manipulationCount < minimum) {
    errors.push(`${file}: ${manipulationCount} manipulation(s) déclarée(s), ${minimum} attendue(s)`);
  }

  const eventTypes = module.activities.flatMap((activity) => activity.analytics?.events || []);
  if (!eventTypes.includes('attempt.completed')) {
    errors.push(`${file}: aucune activité n'émet attempt.completed`);
  }
}

if (!files.length) errors.push('Aucun module déclaratif trouvé');

if (errors.length) {
  console.error(`\n❌ CONTENU LATENT V3 INVALIDE\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`✅ Contenu LATENT V3 valide — ${files.length} module(s), schéma ECDL et références croisées vérifiés.`);
