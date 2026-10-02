import test from 'node:test';
import assert from 'node:assert/strict';
import { FetchContentRepository } from '../src/adapters/web/fetch-content-repository.mjs';
import { LocalProgressRepository } from '../src/adapters/web/local-progress-repository.mjs';
import { LocalLearningEventRepository } from '../src/adapters/web/local-learning-event-repository.mjs';

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

test('content adapter loads module, bank and standalone activity behind the port and returns clones', async () => {
  const calls = [];
  const payloads = new Map([
    ['/content/modules/p0.json', { moduleId: 'p0', title: 'P0', activities: [] }],
    ['/content/assessment-banks/p0.json', { moduleId: 'p0', quiz: [], transfer: [] }],
    ['/content/activities/tokenizer-lab.json', { id: 'tokenizer-lab', type: 'tokenizer-lab', config: { initialText: 'extraordinaire' } }]
  ]);
  const fetchImpl = async (url) => {
    calls.push(url.pathname);
    const payload = payloads.get(url.pathname);
    return { ok: Boolean(payload), status: payload ? 200 : 404, json: async () => structuredClone(payload) };
  };
  const repository = new FetchContentRepository({ contentRoot: new URL('https://example.test/content/'), fetchImpl });
  const first = await repository.getModule('p0');
  first.title = 'mutated outside repository';
  const second = await repository.getModule('p0');
  const bank = await repository.getAssessmentBank('p0');
  const activity = await repository.getActivity('tokenizer-lab');
  activity.config.initialText = 'mutated';
  const activityAgain = await repository.getActivity('tokenizer-lab');

  assert.equal(second.title, 'P0');
  assert.equal(bank.moduleId, 'p0');
  assert.equal(activityAgain.config.initialText, 'extraordinaire');
  assert.deepEqual(calls, [
    '/content/modules/p0.json',
    '/content/assessment-banks/p0.json',
    '/content/activities/tokenizer-lab.json'
  ]);
});

test('progress adapter persists without leaking storage into the domain', async () => {
  const storage = new MemoryStorage();
  const repository = new LocalProgressRepository({ storage, key: 'test-progress' });
  const state = { version: 1, modules: { p0: { quiz: { score: 5, total: 6 } } } };
  await repository.saveLearnerState('local-profile', state);
  const reloaded = await repository.loadLearnerState('local-profile');
  assert.deepEqual(reloaded, state);
  reloaded.modules.p0.quiz.score = 0;
  const untouched = await repository.loadLearnerState('local-profile');
  assert.equal(untouched.modules.p0.quiz.score, 5);
});

test('learning-event adapter filters and caps local traces', async () => {
  const storage = new MemoryStorage();
  const repository = new LocalLearningEventRepository({ storage, key: 'test-events', maxEvents: 2 });
  await repository.append({ id: '1', moduleId: 'p0', type: 'module.opened' });
  await repository.append({ id: '2', moduleId: 'p1', type: 'module.opened' });
  await repository.append({ id: '3', moduleId: 'p0', type: 'attempt.completed' });
  assert.deepEqual((await repository.query()).map((event) => event.id), ['2', '3']);
  assert.deepEqual((await repository.query({ moduleId: 'p0' })).map((event) => event.id), ['3']);
});
