import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dotProduct,
  scaleAttentionScore,
  stableSoftmax,
  applyCausalMask,
  weightedSum,
  evaluateAttention
} from '../src/domain/activities/attention.mjs';

test('dot product and scaling are deterministic', () => {
  assert.equal(dotProduct([1, 0], [0.9, 0.1]), 0.9);
  assert.ok(Math.abs(scaleAttentionScore(2, 4) - 1) < 1e-12);
});

test('stable softmax sums to one and is shift invariant', () => {
  const a = stableSoftmax([4.2, 3.8, 0.4]);
  const b = stableSoftmax([104.2, 103.8, 100.4]);
  assert.ok(Math.abs(a.reduce((s, x) => s + x, 0) - 1) < 1e-12);
  a.forEach((value, index) => assert.ok(Math.abs(value - b[index]) < 1e-12));
});

test('causal mask forbids future positions', () => {
  assert.deepEqual(applyCausalMask([1, 2, 3, 4], 1), [1, 2, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]);
});

test('weighted sum combines value vectors', () => {
  const result = weightedSum([[1, 0], [0, 2]], [0.25, 0.75]);
  assert.deepEqual(result, [0.25, 1.5]);
});

test('full attention returns normalized weights and weighted output', () => {
  const result = evaluateAttention({
    query: [1, 0],
    keys: [[0.9, 0.1], [0.8, 0.2], [0.1, 0.9]],
    values: [[1, 0], [0.5, 0.5], [0, 1]],
    queryIndex: 2,
    causal: false,
    scaling: true
  });
  assert.equal(result.rawScores.length, 3);
  assert.ok(Math.abs(result.weights.reduce((s, x) => s + x, 0) - 1) < 1e-12);
  assert.equal(result.output.length, 2);
  assert.ok(result.weights[0] > result.weights[2]);
});

test('full attention masks future positions when causal', () => {
  const result = evaluateAttention({
    query: [1, 1],
    keys: [[1, 0], [0, 1], [1, 1]],
    values: [[1, 0], [0, 1], [9, 9]],
    queryIndex: 1,
    causal: true,
    scaling: true
  });
  assert.equal(result.weights[2], 0);
  assert.notDeepEqual(result.output, [9, 9]);
});

test('invalid dimensions fail loudly', () => {
  assert.throws(() => dotProduct([1], [1, 2]), /same dimension/);
  assert.throws(() => evaluateAttention({ query: [1, 0], keys: [[1]], values: [[1]], queryIndex: 0 }), /same dimension/);
});
