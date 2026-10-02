import { createLearningEvent } from '../../domain/analytics/learning-event.mjs';
import { FetchContentRepository } from '../../adapters/web/fetch-content-repository.mjs';
import { LocalLearningEventRepository } from '../../adapters/web/local-learning-event-repository.mjs';
import { renderActivity } from '../../adapters/web/module-renderer.mjs';

const PROFILE_ID = 'local-profile';
const COURSE_ID = 'latent-llm';
const MODULE_ID = 'tokenizer-slice';
const ACTIVITY_ID = 'tokenizer-lab';

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

function randomId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const runtime = await detectRuntime();
const contentRepository = new FetchContentRepository({ contentRoot: new URL('../../../content/', import.meta.url) });
const eventRepository = new LocalLearningEventRepository();
const activity = await contentRepository.getActivity(ACTIVITY_ID);
const sessionId = randomId('session');
const root = document.getElementById('tokenizerRoot');
const runtimeCard = document.getElementById('runtimeCard');
const eventCount = document.getElementById('eventCount');

if (!root) throw new Error('tokenizerRoot is required');

if (runtimeCard) {
  runtimeCard.textContent = runtime.runtime === 'electron'
    ? `Electron ${runtime.electronVersion || ''} · ${runtime.platform}`
    : `Web · ${runtime.platform}`;
}

function makeEvent(type, activityId, payload = {}) {
  return createLearningEvent({
    id: randomId('evt'),
    at: new Date().toISOString(),
    profileId: PROFILE_ID,
    sessionId,
    courseId: COURSE_ID,
    moduleId: MODULE_ID,
    activityId,
    type,
    payload,
    contentVersion: activity.version,
    appVersion: runtime.appVersion || 'unknown'
  });
}

async function refreshEventCount() {
  if (!eventCount) return;
  const count = await eventRepository.count({ moduleId: MODULE_ID });
  eventCount.textContent = `${count} événement${count > 1 ? 's' : ''}`;
}

function emit(type, activityId, payload = {}) {
  const event = makeEvent(type, activityId, payload);
  eventRepository.append(event).then(refreshEventCount);
  return event;
}

root.replaceChildren(renderActivity(activity, {}, emit));
root.dataset.activityId = activity.id;
root.dataset.contentVersion = activity.version;
root.dataset.renderedFrom = 'standalone-activity';
await eventRepository.append(makeEvent('module.opened', activity.id, { runtime: runtime.runtime, slice: 'tokenizer' }));
await refreshEventCount();
