import test from 'node:test';
import assert from 'node:assert/strict';
import { rotatePair, applyRoPESimplified, representAtPosition } from '../src/domain/activities/position.mjs';

function norm(vector) { return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)); }

test('rotatePair preserves vector norm', () => {
  const source = [1, 2];
  const rotated = rotatePair(source, Math.PI / 3);
  assert.ok(Math.abs(norm(source) - norm(rotated)) < 1e-10);
});

test('RoPE simplified leaves position zero unchanged', () => {
  assert.deepEqual(applyRoPESimplified([1, 0, 0, 1], 0), [1, 0, 0, 1]);
});

test('RoPE simplified changes coordinates while preserving norm at later positions', () => {
  const source = [1, 0, 0, 1];
  const out = applyRoPESimplified(source, 3);
  assert.notDeepEqual(out, source);
  assert.ok(Math.abs(norm(out) - norm(source)) < 1e-10);
});

test('representAtPosition keeps token identity distinct from positional representation', () => {
  const result = representAtPosition({ tokenId: 4317, vector: [1, 0], position: 2, mode: 'rope' });
  assert.equal(result.tokenId, 4317);
  assert.equal(result.position, 2);
  assert.notDeepEqual(result.positioned, result.base);
});

test('none position mode preserves the base vector exactly', () => {
  const result = representAtPosition({ tokenId: 7, vector: [0.2, -0.4], position: 5, mode: 'none' });
  assert.deepEqual(result.positioned, [0.2, -0.4]);
});
