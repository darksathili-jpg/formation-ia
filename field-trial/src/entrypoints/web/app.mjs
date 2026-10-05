import { loadModuleBundle } from '../../application/load-module-bundle.mjs';
import { evaluateMastery } from '../../domain/learning/mastery.mjs';
import { createLearningEvent } from '../../domain/analytics/learning-event.mjs';
import { FetchContentRepository } from '../../adapters/web/fetch-content-repository.mjs';
import { LocalProgressRepository } from '../../adapters/web/local-progress-repository.mjs';
import { LocalLearningEventRepository } from '../../adapters/web/local-learning-event-repository.mjs';
import { renderModule } from '../../adapters/web/module-renderer.mjs';
import { enhanceAttentionActivities } from '../../adapters/web/attention-renderer.mjs';
import { enhanceTransformerBlockActivities } from '../../adapters/web/transformer-block-renderer.mjs';
import { enhanceSamplingActivities } from '../../adapters/web/sampling-renderer.mjs';

const PROFILE_ID = 'local-profile';
const EVENT_COURSE_ID = 'latent-llm';
const INTEGRATED_COURSE_ID = 'p1';
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

function courseHref(moduleId) {
  return `./index.html?module=${encodeURIComponent(moduleId)}`;
}

const runtime = await detectRuntime();
const contentRepository = new FetchContentRepository({ contentRoot: new URL('../../../content/', import.meta.url) });
const course = await contentRepository.getCourse(INTEGRATED_COURSE_ID);
if (!course.moduleSequence?.some((module) => module.id === MODULE_ID)) {
  throw new Error(`Module ${MODULE_ID} absent du parcours intégré ${course.courseId}`);
}
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
const courseNav = document.getElementById('courseNav');
const coursePager = document.getElementById('coursePager');
const moduleIdentity = document.getElementById('moduleIdentity');
const moduleSourceLabel = document.getElementById('moduleSourceLabel');
const p2LockState = document.getElementById('p2LockState');

document.title = `LATENT V3 · ${view.title}`;
if (moduleIdentity) moduleIdentity.textContent = `${view.id.toUpperCase()} · ${view.status}`;
if (moduleSourceLabel) moduleSourceLabel.textContent = `${view.id}.json · ${view.version}`;
if (p2LockState) {
  p2LockState.textContent = course.p2Unlocked ? 'Ouvert après revue humaine' : 'Verrouillé · Learner Gate requis';
  p2LockState.dataset.state = course.p2Unlocked ? 'open' : 'locked';
}

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

function moduleProgress(moduleId) {
  return state.modules?.[moduleId]?.mastery?.status || 'not-started';
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
    courseId: EVENT_COURSE_ID,
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

function renderCourseNavigation() {
  if (!courseNav || !coursePager) return;
  courseNav.replaceChildren();
  const currentIndex = course.moduleSequence.findIndex((module) => module.id === view.id);
  course.moduleSequence.forEach((module, index) => {
    const link = document.createElement('a');
    link.href = courseHref(module.id);
    link.dataset.courseModule = module.id;
    link.dataset.progress = moduleProgress(module.id);
    link.textContent = `${index + 1}. ${module.title}`;
    if (module.id === view.id) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    link.addEventListener('click', () => emit('course.navigation', null, { from: view.id, to: module.id }));
    courseNav.append(link);
  });

  coursePager.replaceChildren();
  const previous = course.moduleSequence[currentIndex - 1];
  const next = course.moduleSequence[currentIndex + 1];
  if (previous) {
    const link = document.createElement('a');
    link.className = 'course-pager-link previous';
    link.href = courseHref(previous.id);
    link.textContent = `← ${previous.title}`;
    link.addEventListener('click', () => emit('course.navigation', null, { from: view.id, to: previous.id }));
    coursePager.append(link);
  }
  const spacer = document.createElement('span');
  spacer.className = 'course-pager-spacer';
  coursePager.append(spacer);
  if (next) {
    const link = document.createElement('a');
    link.className = 'course-pager-link next';
    link.href = courseHref(next.id);
    link.textContent = `${next.title} →`;
    link.addEventListener('click', () => emit('course.navigation', null, { from: view.id, to: next.id }));
    coursePager.append(link);
  } else {
    const gate = document.createElement('a');
    gate.className = 'course-pager-link next gate';
    gate.href = './learner-gate.html';
    gate.textContent = 'Passer au Learner Gate →';
    coursePager.append(gate);
  }
}

async function onEvidence(kind, score, total) {
  const moduleState = state.modules[view.id] ||= {};
  const previous = evaluateMastery(moduleState, view.assessment.masteryPolicy);
  moduleState[kind] = { score, total, at: new Date().toISOString() };
  const next = evaluateMastery(moduleState, view.assessment.masteryPolicy);
  moduleState.mastery = { status: next, updatedAt: new Date().toISOString() };
  await progressRepository.saveLearnerState(PROFILE_ID, state);
  updateMasteryUi();
  renderCourseNavigation();
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
enhanceAttentionActivities({ root: moduleRoot, view, emit });
enhanceTransformerBlockActivities({ root: moduleRoot, view, emit });
enhanceSamplingActivities({ root: moduleRoot, view, emit });

updateMasteryUi();
renderCourseNavigation();
await eventRepository.append(makeEvent('module.opened', null, { runtime: runtime.runtime, integratedCourseId: course.courseId }));
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
  renderCourseNavigation();
  emit('mastery.changed', null, { from: 'reset', to: 'not-started', trigger: 'manual-reset' });
});
