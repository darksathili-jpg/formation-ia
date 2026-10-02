import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateChoice, evaluateComponentMission, evaluateOrder, scoreChoiceSet } from '../src/domain/activities/decision.mjs';

test('component mission distinguishes impossible, sufficient and minimal configurations', () => {
  const mission = { needs: ['model', 'ui', 'retrieval'] };
  assert.deepEqual(evaluateComponentMission(mission, ['model', 'ui']), {
    capable: false,
    minimal: false,
    missing: ['retrieval'],
    extras: [],
    required: ['model', 'ui', 'retrieval'],
    selected: ['model', 'ui']
  });
  const over = evaluateComponentMission(mission, ['model', 'ui', 'retrieval', 'memory']);
  assert.equal(over.capable, true);
  assert.equal(over.minimal, false);
  assert.deepEqual(over.extras, ['memory']);
  const minimal = evaluateComponentMission(mission, ['model', 'ui', 'retrieval']);
  assert.equal(minimal.capable, true);
  assert.equal(minimal.minimal, true);
});

test('rank order reports incomplete and exact chains', () => {
  assert.equal(evaluateOrder(['IA', 'ML', 'DL', 'LLM'], ['IA', 'ML']).complete, false);
  assert.equal(evaluateOrder(['IA', 'ML', 'DL', 'LLM'], ['IA', 'DL', 'ML', 'LLM']).correct, false);
  assert.equal(evaluateOrder(['IA', 'ML', 'DL', 'LLM'], ['IA', 'ML', 'DL', 'LLM']).correct, true);
});

test('choice scoring separates unanswered from incorrect answers', () => {
  const items = [
    { id: 'a', choices: ['x', 'y'], answer: 1 },
    { id: 'b', choices: ['x', 'y'], answer: 0 }
  ];
  assert.deepEqual(evaluateChoice(items[0], ''), { answered: false, correct: false, answer: '' });
  const partial = scoreChoiceSet(items, { a: 1 });
  assert.equal(partial.score, 1);
  assert.equal(partial.answered, 1);
  assert.equal(partial.complete, false);
  const full = scoreChoiceSet(items, { a: 1, b: 0 });
  assert.equal(full.score, 2);
  assert.equal(full.ratio, 1);
  assert.equal(full.complete, true);
});
