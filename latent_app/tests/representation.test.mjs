import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, dotProduct, resolveTokenRepresentation, vectorNorm } from '../src/domain/activities/representation.mjs';

const closeTo = (actual, expected, epsilon = 1e-12) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} ≠ ${expected}`);

test('dot product and norm are deterministic', () => {
  assert.equal(dotProduct([1, 2], [3, 4]), 11);
  assert.equal(vectorNorm([3, 4]), 5);
});

test('cosine of identical vectors is 1', () => {
  const result = cosineSimilarity([2, 1], [2, 1]);
  assert.equal(result.defined, true);
  closeTo(result.value, 1);
});

test('cosine of orthogonal vectors is 0', () => {
  const result = cosineSimilarity([1, 0], [0, 1]);
  assert.equal(result.defined, true);
  closeTo(result.value, 0);
});

test('cosine is invariant under positive scaling', () => {
  const base = cosineSimilarity([1, 2], [2, 1]);
  const scaled = cosineSimilarity([10, 20], [6, 3]);
  assert.equal(base.defined, true);
  assert.equal(scaled.defined, true);
  closeTo(base.value, scaled.value);
});

test('cosine explicitly reports a zero-vector as undefined', () => {
  assert.deepEqual(cosineSimilarity([0, 0], [1, 2]), {
    defined: false,
    value: null,
    reason: 'zero-vector'
  });
});

test('token representation keeps ID and vector as distinct objects', () => {
  const result = resolveTokenRepresentation('bonjour', { bonjour: 821 }, { 821: [0.2, -0.5, 0.8] });
  assert.equal(result.token, 'bonjour');
  assert.equal(result.id, 821);
  assert.deepEqual(result.vector, [0.2, -0.5, 0.8]);
  assert.notEqual(result.id, result.vector);
});

test('representation engine rejects dimension and vocabulary errors', () => {
  assert.throws(() => dotProduct([1], [1, 2]), /same dimension/);
  assert.throws(() => cosineSimilarity([], [1]), /non-empty/);
  assert.throws(() => resolveTokenRepresentation('absent', {}, {}), /unknown token/);
});
