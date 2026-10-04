import { loadModuleBundle } from '../../application/load-module-bundle.mjs';
import { evaluateMastery } from '../../domain/learning/mastery.mjs';
import { createLearningEvent } from '../../domain/analytics/learning-event.mjs';
import { FetchContentRepository } from '../../adapters/web/fetch-content-repository.mjs';
import { LocalProgressRepository } from '../../adapters/web/local-progress-repository.mjs';
import { LocalLearningEventRepository } from '../../adapters/web/local-learning-event-repository.mjs';
import { renderModule } from '../../adapters/web/module-renderer.mjs';

const PROFILE_ID = 'local-profile';
const COURSE_ID = 'latent-llm';
const MODULE_ID = new URLSearchParams(globalThis.location?.search || '').get('module') || 'p0';

async function detectRuntime() {
  if (window.latentDesktop?.getRuntimeInfo) {
    try {
      return await window.latentDesktop.getRuntimeInfo();
    } catch {
      return { runtime: 'electron', platform: 'unknown', appVersion: 'unknown' };
    }
  }
  return {
    runtime: 'web',
    platform: navigator.platform || 'browser',
    appVersion: '0.1.0-alpha.1'
  };
}

function sessionId() {
  return globalThis.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const runtime = await detectRuntime();
const contentRepository = new FetchContentRepository({ contentRoot: new URL('../../../content/', import.meta.url) });
const { view, assessmentBank } = await loadModuleBundle({ contentRepository, moduleId: MODULE_ID });
const progressRepository = new LocalProgressRepository();
const eventRepository = new LocalLearningEventRepository();
const session = sessionId();
let state = await progressRepository.loadLearnerState(PROFILE_ID);
state.modules ||= {};
state.modules[view.id] ||= {};

const runtimeCard = document.getElementById('runtimeCard');
const masteryStatus = document.getElementById('masteryStatus');
const eventCount = document.getElementById('eventCount');
const moduleRoot = document.getElementById('moduleRoot');
const moduleNav = document.getElementById('moduleNav');
const moduleIdentity = document.getElementById('moduleIdentity');
const moduleSourceLabel = document.getElementById('moduleSourceLabel');

document.title = `LATENT V3 · ${view.title}`;
if (moduleIdentity) moduleIdentity.textContent = `${view.id.toUpperCase()} · ${view.status}`;
if (moduleSourceLabel) moduleSourceLabel.textContent = `${view.id}.json · ${view.version}`;

if (runtimeCard) {
  runtimeCard.textContent = runtime.runtime === 'electron'
    ? `Electron ${runtime.electronVersion || ''} · ${runtime.platform}`
    : `Web · ${runtime.platform}`;
}

function masteryLabel(status) {
  return ({
    'not-started': 'À construire',
    learning: 'En apprentissage',
    evidence: 'Preuve partielle',
    mastered: 'Maîtrise démontrée'
  })[status] || status;
}

function updateMasteryUi() {
  const moduleState = state.modules[view.id] || {};
  const status = evaluateMastery(moduleState, view.assessment.masteryPolicy);
  if (masteryStatus) {
    masteryStatus.textContent = masteryLabel(status);
    masteryStatus.dataset.state = status;
  }
  return status;
}

async function refreshEventCount() {
  if (!eventCount) return;
  const count = await eventRepository.count({ moduleId: view.id });
  eventCount.textContent = `${count} événement${count > 1 ? 's' : ''}`;
}

function makeEvent(type, activityId, payload) {
  return createLearningEvent({
    id: globalThis.crypto?.randomUUID?.() || `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    profileId: PROFILE_ID,
    sessionId: session,
    courseId: COURSE_ID,
    moduleId: view.id,
    activityId,
    type,
    payload,
    contentVersion: view.version,
    appVersion: runtime.appVersion || 'unknown'
  });
}

function emit(type, activityId, payload = {}) {
  const event = makeEvent(type, activityId, payload);
  eventRepository.append(event).then(refreshEventCount);
  return event;
}

async function onEvidence(kind, score, total) {
  const moduleState = state.modules[view.id] ||= {};
  const previous = evaluateMastery(moduleState, view.assessment.masteryPolicy);
  moduleState[kind] = { score, total, at: new Date().toISOString() };
  const next = evaluateMastery(moduleState, view.assessment.masteryPolicy);
  moduleState.mastery = { status: next, updatedAt: new Date().toISOString() };
  await progressRepository.saveLearnerState(PROFILE_ID, state);
  updateMasteryUi();
  if (next !== previous) emit('mastery.changed', null, { from: previous, to: next, trigger: kind });
}

renderModule({
  root: moduleRoot,
  navigation: moduleNav,
  view,
  assessmentBank,
  emit,
  onEvidence
});

updateMasteryUi();
await eventRepository.append(makeEvent('module.opened', null, { runtime: runtime.runtime }));
await refreshEventCount();

const links = [...moduleNav.querySelectorAll('a')];
const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-18% 0px -65% 0px', threshold: [0.05, 0.3] });
  sections.forEach((section) => observer.observe(section));
}

document.getElementById('resetProgress')?.addEventListener('click', async () => {
  if (!confirm('Réinitialiser les preuves de maîtrise et la progression locale de ce module ?')) return;
  state = await progressRepository.resetLearnerState(PROFILE_ID);
  state.modules ||= {};
  state.modules[view.id] = {};
  updateMasteryUi();
  emit('mastery.changed', null, { from: 'reset', to: 'not-started', trigger: 'manual-reset' });
});
