import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModuleBundle } from '../src/application/load-module-bundle.mjs';

test('loadModuleBundle resolves declared shared activities without copying them into the module', async () => {
  const module = {
    moduleId: 'demo',
    version: '3.0.0-alpha.1',
    title: 'Demo',
    status: 'design-ready',
    audience: { track: 'discover', prerequisites: [] },
    outcomes: [],
    evidence: [],
    sharedActivityIds: ['shared-lab'],
    activities: [
      { id: 'quiz', type: 'quiz', purpose: 'assess', evidenceIds: [], config: {} },
      { id: 'transfer', type: 'transfer-cards', purpose: 'transfer', evidenceIds: [], config: {} },
      { id: 'example', type: 'worked-example', purpose: 'acquire', evidenceIds: [], config: {} }
    ],
    sections: [
      { id: 'practice', title: 'Practice', activityIds: ['shared-lab', 'example'] },
      { id: 'assess', title: 'Assess', activityIds: ['quiz', 'transfer'] }
    ],
    assessment: { masteryPolicy: { quizThreshold: 0.8, transferThreshold: 0.8 }, quizActivityId: 'quiz', transferActivityId: 'transfer' },
    references: []
  };
  const shared = { id: 'shared-lab', type: 'tokenizer-lab', purpose: 'practice', evidenceIds: [], config: {} };
  const bank = { moduleId: 'demo', quiz: [], transfer: [] };
  const calls = [];
  const repository = {
    async getModule(id) { calls.push(['module', id]); return structuredClone(module); },
    async getActivity(id) { calls.push(['activity', id]); return structuredClone(shared); },
    async getAssessmentBank(id) { calls.push(['bank', id]); return structuredClone(bank); }
  };

  const bundle = await loadModuleBundle({ contentRepository: repository, moduleId: 'demo' });

  assert.deepEqual(calls, [['module', 'demo'], ['activity', 'shared-lab'], ['bank', 'demo']]);
  assert.equal(bundle.view.activityById.get('shared-lab').type, 'tokenizer-lab');
  assert.equal(bundle.view.sections[0].activities[0].id, 'shared-lab');
  assert.deepEqual(bundle.view.sharedActivityIds, ['shared-lab']);
});

test('module presenter refuses unresolved or undeclared shared activities', async () => {
  const base = {
    moduleId: 'demo', version: '3.0.0-alpha.1', title: 'Demo', status: 'design-ready',
    audience: { track: 'discover', prerequisites: [] }, outcomes: [], evidence: [],
    sharedActivityIds: ['missing'],
    activities: [
      { id: 'quiz', type: 'quiz', purpose: 'assess', evidenceIds: [], config: {} },
      { id: 'transfer', type: 'transfer-cards', purpose: 'transfer', evidenceIds: [], config: {} },
      { id: 'example', type: 'worked-example', purpose: 'acquire', evidenceIds: [], config: {} }
    ],
    sections: [{ id: 'assess', title: 'Assess', activityIds: ['quiz', 'transfer'] }],
    assessment: { masteryPolicy: { quizThreshold: 0.8, transferThreshold: 0.8 }, quizActivityId: 'quiz', transferActivityId: 'transfer' },
    references: []
  };
  const repository = {
    async getModule() { return structuredClone(base); },
    async getActivity() { throw new Error('activity missing'); },
    async getAssessmentBank() { return { moduleId: 'demo', quiz: [], transfer: [] }; }
  };
  await assert.rejects(() => loadModuleBundle({ contentRepository: repository, moduleId: 'demo' }), /activity missing/);
});
