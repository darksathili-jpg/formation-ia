import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateContextBudget } from '../src/domain/activities/context-budget.mjs';

test('context budget accepts an exact fit', () => {
  assert.deepEqual(evaluateContextBudget(4, 4), {
    limit: 4,
    total: 4,
    used: 4,
    available: 0,
    overflow: 0,
    withinBudget: true,
    ratio: 1
  });
});

test('context budget reports available capacity below the limit', () => {
  const result = evaluateContextBudget(3, 8);
  assert.equal(result.used, 3);
  assert.equal(result.available, 5);
  assert.equal(result.overflow, 0);
  assert.equal(result.withinBudget, true);
});

test('context budget reports overflow without truncating total', () => {
  const result = evaluateContextBudget(7, 4);
  assert.equal(result.total, 7);
  assert.equal(result.used, 4);
  assert.equal(result.available, 0);
  assert.equal(result.overflow, 3);
  assert.equal(result.withinBudget, false);
});

test('context budget handles an empty sequence', () => {
  const result = evaluateContextBudget(0, 4);
  assert.equal(result.used, 0);
  assert.equal(result.available, 4);
  assert.equal(result.ratio, 0);
});

test('context budget rejects invalid values', () => {
  assert.throws(() => evaluateContextBudget(-1, 4), /tokenCount/);
  assert.throws(() => evaluateContextBudget(2.5, 4), /tokenCount/);
  assert.throws(() => evaluateContextBudget(2, 0), /limit/);
});
