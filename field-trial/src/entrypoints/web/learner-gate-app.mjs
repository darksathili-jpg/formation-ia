import { FetchContentRepository } from '../../adapters/web/fetch-content-repository.mjs';
import { LocalProgressRepository } from '../../adapters/web/local-progress-repository.mjs';
import { LocalLearningEventRepository } from '../../adapters/web/local-learning-event-repository.mjs';
import { LocalFieldObservationRepository } from '../../adapters/web/local-field-observation-repository.mjs';
import { createParticipantPacket, evaluateLearnerGate } from '../../domain/analytics/learner-gate.mjs';

const PROFILE_ID = 'local-profile';
const EVENT_COURSE_ID = 'latent-llm';
const COURSE_ID = 'p1';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text != null) node.textContent = String(options.text);
  for (const [name, value] of Object.entries(options.attrs || {})) if (value != null) node.setAttribute(name, String(value));
  for (const child of Array.isArray(children) ? children : [children]) if (child) node.append(child);
  return node;
}

function randomParticipantId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  globalThis.crypto?.getRandomValues?.(bytes);
  const body = [...bytes].slice(0, 8).map((value, index) => alphabet[(value || (Date.now() >> index)) % alphabet.length]).join('');
  return `P-${body}`;
}

function percent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)} %` : '—';
}

function seconds(value) {
  if (!Number.isFinite(value)) return '—';
  return value < 120 ? `${Math.round(value)} s` : `${(value / 60).toFixed(1).replace('.', ',')} min`;
}

function stateClass(value) {
  return value === true ? 'metric-pass' : value === false ? 'metric-fail' : 'metric-pending';
}

function selectField(label, values, current, onChange) {
  const select = el('select', { attrs: { 'aria-label': label } });
  select.append(el('option', { text: 'À observer', attrs: { value: '' } }));
  for (const [value, text] of values) select.append(el('option', { text, attrs: { value } }));
  select.value = current == null ? '' : String(current);
  select.addEventListener('change', () => onChange(select.value));
  return el('label', { className: 'observer-field' }, [el('span', { text: label }), select]);
}

const contentRepository = new FetchContentRepository({ contentRoot: new URL('../../../content/', import.meta.url) });
const progressRepository = new LocalProgressRepository();
const eventRepository = new LocalLearningEventRepository();
const observationRepository = new LocalFieldObservationRepository();
const course = await contentRepository.getCourse(COURSE_ID);
const gateConfig = await contentRepository.getLearnerGate(course.learnerGateId);
let observations = await observationRepository.load(gateConfig.gateId);
observations.modules ||= {};
if (!/^P-[A-Z0-9]{6,12}$/.test(observations.participantId || '')) observations.participantId = randomParticipantId();
await observationRepository.save(gateConfig.gateId, observations);

const gateStatusBadge = document.getElementById('gateStatusBadge');
const participantCode = document.getElementById('participantCode');
const localSummary = document.getElementById('localSummary');
const moduleObservationGrid = document.getElementById('moduleObservationGrid');
const exportPacket = document.getElementById('exportPacket');
const cohortFiles = document.getElementById('cohortFiles');
const cohortDecision = document.getElementById('cohortDecision');
const cohortModules = document.getElementById('cohortModules');
const thresholdSummary = document.getElementById('thresholdSummary');

gateStatusBadge.textContent = gateConfig.status;
participantCode.textContent = `Participant pseudonyme : ${observations.participantId}`;

async function buildLocalPacket() {
  const [events, progress] = await Promise.all([
    eventRepository.query({ courseId: EVENT_COURSE_ID }),
    progressRepository.loadLearnerState(PROFILE_ID)
  ]);
  return createParticipantPacket({
    participantId: observations.participantId,
    events,
    progress,
    observations,
    course,
    gateConfig
  });
}

function observerComplete(value = {}) {
  return typeof value.directHelpBeforeFirstAction === 'boolean'
    && Number.isFinite(Number(value.explanationScore))
    && typeof value.delayedTransferPassed === 'boolean'
    && typeof value.criticalMisconceptionPersisted === 'boolean'
    && ['none', 'minor', 'major'].includes(value.blockerSeverity);
}

function renderLocalSummary(packet) {
  localSummary.replaceChildren();
  const modules = Object.values(packet.modules);
  const observationCount = course.moduleSequence.filter(({ id }) => observerComplete(observations.modules[id])).length;
  const cards = [
    ['Modules avec quiz + transfert', `${modules.filter((module) => module.completed).length}/${modules.length}`],
    ['Modules maîtrisés', `${modules.filter((module) => module.mastered).length}/${modules.length}`],
    ['Observations complètes', `${observationCount}/${modules.length}`],
    ['Parcours complet', packet.courseCompleted ? 'oui' : 'pas encore']
  ];
  localSummary.append(el('div', { className: 'gate-summary-grid' }, cards.map(([label, value]) => el('div', { className: 'gate-kpi' }, [el('span', { text: label }), el('strong', { text: value })]))));
}

async function saveObservation(moduleId, patch) {
  observations.modules[moduleId] ||= {};
  Object.assign(observations.modules[moduleId], patch);
  await observationRepository.save(gateConfig.gateId, observations);
  const packet = await buildLocalPacket();
  renderLocalSummary(packet);
}

function renderObserverCards(packet) {
  moduleObservationGrid.replaceChildren();
  for (const moduleMeta of course.moduleSequence) {
    const summary = packet.modules[moduleMeta.id];
    const observed = observations.modules[moduleMeta.id] ||= {};
    const auto = el('div', { className: 'observer-auto' }, [
      el('div', {}, [el('span', { text: 'Première action' }), el('strong', { text: seconds(summary.firstMeaningfulActionSeconds) })]),
      el('div', {}, [el('span', { text: 'Quiz' }), el('strong', { text: percent(summary.quizRatio) })]),
      el('div', {}, [el('span', { text: 'Transfert' }), el('strong', { text: percent(summary.transferRatio) })]),
      el('div', {}, [el('span', { text: 'Maîtrise' }), el('strong', { text: summary.mastered ? 'démontrée' : (summary.masteryStatus || '—') })])
    ]);

    const form = el('div', { className: 'observer-form' });
    form.append(
      selectField('Aide conceptuelle directe avant la première manipulation', [['false', 'Non'], ['true', 'Oui']], observed.directHelpBeforeFirstAction, (value) => saveObservation(moduleMeta.id, { directHelpBeforeFirstAction: value === '' ? null : value === 'true' })),
      selectField('Qualité de l’explication sans écran', [['0', '0 · ne peut pas expliquer'], ['1', '1 · partiel / sans causalité claire'], ['2', '2 · causal + limite importante']], observed.explanationScore, (value) => saveObservation(moduleMeta.id, { explanationScore: value === '' ? null : Number(value) })),
      selectField('Transfert différé réussi (24 h à 7 jours)', [['true', 'Oui'], ['false', 'Non']], observed.delayedTransferPassed, (value) => saveObservation(moduleMeta.id, { delayedTransferPassed: value === '' ? null : value === 'true' })),
      selectField('Misconception critique encore présente', [['false', 'Non'], ['true', 'Oui']], observed.criticalMisconceptionPersisted, (value) => saveObservation(moduleMeta.id, { criticalMisconceptionPersisted: value === '' ? null : value === 'true' })),
      selectField('Blocage maximal observé', [['none', 'Aucun'], ['minor', 'Mineur'], ['major', 'Majeur']], observed.blockerSeverity, (value) => saveObservation(moduleMeta.id, { blockerSeverity: value || null }))
    );
    const note = el('textarea', { attrs: { rows: 3, maxlength: 1000, placeholder: 'Note factuelle sans nom ni donnée personnelle…', 'aria-label': `Note d'observation ${moduleMeta.title}` } });
    note.value = observed.note || '';
    note.addEventListener('change', () => saveObservation(moduleMeta.id, { note: note.value.slice(0, 1000) }));
    form.append(el('label', { className: 'observer-field observer-field-wide' }, [el('span', { text: 'Note factuelle (optionnelle, sans donnée personnelle)' }), note]));

    moduleObservationGrid.append(el('article', { className: 'observer-card' }, [
      el('div', {}, [el('p', { className: 'eyebrow', text: moduleMeta.id.toUpperCase() }), el('h3', { text: moduleMeta.title }), auto]),
      form
    ]));
  }
}

function renderThresholds() {
  thresholdSummary.replaceChildren();
  const t = gateConfig.thresholds;
  const rows = [
    ['Participants minimum', gateConfig.protocol.minimumParticipants],
    ['Parcours complet', `≥ ${percent(t.courseCompletionRate)}`],
    ['Première action médiane', `≤ ${t.medianFirstMeaningfulActionSecondsMax} s`],
    ['Aide précoce directe', `≤ ${percent(t.directHelpBeforeFirstActionRateMax)}`],
    ['Quiz médian', `≥ ${percent(t.medianQuizRatioMin)}`],
    ['Transfert médian', `≥ ${percent(t.medianTransferRatioMin)}`],
    ['Maîtrise', `≥ ${percent(t.masteryRateMin)}`],
    ['Explication', `≥ ${String(t.medianExplanationScoreMin).replace('.', ',')} / 2`],
    ['Transfert différé', `≥ ${percent(t.delayedTransferPassRateMin)}`],
    ['Misconception persistante', `≤ ${percent(t.criticalMisconceptionPersistenceRateMax)}`],
    ['Blocage majeur', `≤ ${t.majorBlockerCountMax}`]
  ];
  for (const [label, value] of rows) thresholdSummary.append(el('div', { className: 'threshold-item' }, [el('span', { text: label }), el('strong', { text: value })]));
}

function metric(label, value) {
  return el('div', { className: 'cohort-metric' }, [el('span', { text: label }), el('strong', { text: value })]);
}

function renderCohort(result) {
  cohortDecision.replaceChildren();
  cohortDecision.dataset.state = result.decision;
  const decisionLabel = ({
    'pending-field-evidence': 'Preuves insuffisantes : poursuivre le test terrain.',
    'revise-before-p2': 'Seuil(s) non atteint(s) : corriger P1 avant P2.',
    'eligible-for-human-approval': 'Tous les seuils sont atteints : revue humaine possible, P2 reste verrouillé.'
  })[result.decision] || result.decision;
  cohortDecision.append(
    el('strong', { text: decisionLabel }),
    el('p', { text: `${result.participantCount}/${result.minimumParticipants} participant(s) minimum · parcours complet ${percent(result.courseCompletionRate)} · ${result.failedChecks.length} échec(s) · ${result.missingEvidence.length} preuve(s) manquante(s).` })
  );

  cohortModules.replaceChildren();
  for (const moduleMeta of course.moduleSequence) {
    const entry = result.modules[moduleMeta.id];
    const m = entry.metrics;
    const failed = entry.checks.filter((check) => check.state === 'fail').length;
    const missing = entry.checks.filter((check) => check.state === 'missing-evidence').length;
    cohortModules.append(el('article', { className: 'cohort-card' }, [
      el('h3', { text: `${moduleMeta.id.toUpperCase()} · ${moduleMeta.title}` }),
      el('div', { className: 'cohort-metrics' }, [
        metric('Complétion', percent(m.completionRate)),
        metric('1re action médiane', seconds(m.medianFirstMeaningfulActionSeconds)),
        metric('Quiz médian', percent(m.medianQuizRatio)),
        metric('Transfert médian', percent(m.medianTransferRatio)),
        metric('Maîtrise', percent(m.masteryRate)),
        metric('Aide précoce', percent(m.directHelpBeforeFirstActionRate)),
        metric('Explication', Number.isFinite(m.medianExplanationScore) ? `${String(m.medianExplanationScore).replace('.', ',')} / 2` : '—'),
        metric('Transfert différé', percent(m.delayedTransferPassRate)),
        metric('Misconception persistante', percent(m.criticalMisconceptionPersistenceRate)),
        metric('Gate', failed ? `${failed} échec(s)` : missing ? `${missing} manque(s)` : 'OK')
      ])
    ]));
  }
}

exportPacket.addEventListener('click', async () => {
  const packet = await buildLocalPacket();
  const blob = new Blob([`${JSON.stringify(packet, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `latent-p1-${packet.participantId}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

cohortFiles.addEventListener('change', async () => {
  const packets = [];
  const rejected = [];
  for (const file of [...cohortFiles.files]) {
    try {
      const value = JSON.parse(await file.text());
      if (value?.schema !== 'latent-learner-gate-packet') throw new Error('format inconnu');
      packets.push(value);
    } catch (error) {
      rejected.push(`${file.name}: ${error.message}`);
    }
  }
  const result = evaluateLearnerGate({ packets, course, gateConfig });
  renderCohort(result);
  if (rejected.length) cohortDecision.append(el('p', { className: 'metric-fail', text: `Fichiers ignorés : ${rejected.join(' · ')}` }));
});

const initialPacket = await buildLocalPacket();
renderLocalSummary(initialPacket);
renderObserverCards(initialPacket);
renderThresholds();
renderCohort(evaluateLearnerGate({ packets: [], course, gateConfig }));
