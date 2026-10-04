import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateKvCache } from '../src/domain/activities/kv-cache.mjs';

test('KV cache reuses past positions and computes only new positions in the didactic model', () => {
  const result = evaluateKvCache({ pastTokenCount: 12, newTokenCount: 1 });
  assert.equal(result.recomputedWithoutCache, 13);
  assert.equal(result.computedWithCache, 1);
  assert.equal(result.reusedPastPositions, 12);
  assert.equal(result.computeSaved, 12);
  assert.equal(result.storedVectors, 24);
});

test('KV cache explicitly trades compute for memory', () => {
  const result = evaluateKvCache({ pastTokenCount: 8, newTokenCount: 2 });
  assert.equal(result.tradesComputeForMemory, true);
  assert.ok(result.storedVectors > 0);
  assert.ok(result.computeSaved > 0);
});

test('KV cache is not persistent user memory and does not change model weights', () => {
  const result = evaluateKvCache({ pastTokenCount: 20, newTokenCount: 1 });
  assert.equal(result.isPersistentUserMemory, false);
  assert.equal(result.changesModelWeights, false);
});

test('empty past sequence offers no reuse benefit', () => {
  const result = evaluateKvCache({ pastTokenCount: 0, newTokenCount: 1 });
  assert.equal(result.computeSaved, 0);
  assert.equal(result.storedVectors, 0);
  assert.equal(result.tradesComputeForMemory, false);
});
