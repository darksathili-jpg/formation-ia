import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalProgressRepository } from '../src/adapters/web/local-progress-repository.mjs';
import { LocalLearningEventRepository } from '../src/adapters/web/local-learning-event-repository.mjs';

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

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
