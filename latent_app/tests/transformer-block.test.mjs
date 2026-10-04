import test from 'node:test';
import assert from 'node:assert/strict';
import { addVectors, rmsNormalize, evaluatePreNormBlock } from '../src/domain/activities/transformer-block.mjs';

test('addVectors preserves dimension and adds componentwise', () => {
  assert.deepEqual(addVectors([1, 2], [0.5, -1]), [1.5, 1]);
});

test('rmsNormalize produces RMS approximately 1', () => {
  const out = rmsNormalize([3, 4]);
  const rms = Math.sqrt(out.reduce((sum, value) => sum + value * value, 0) / out.length);
  assert.ok(Math.abs(rms - 1) < 1e-8);
});

test('pre-norm block applies residual additions around attention and MLP', () => {
  const result = evaluatePreNormBlock({
    input: [1, 0.5],
    attentionGain: [0.2, -0.1],
    mlpGain: [0.3, 0.4],
    normalization: true,
    residual: true,
    mlp: true
  });
  assert.equal(result.architecture, 'didactic-pre-norm');
  assert.equal(result.output.length, 2);
  assert.notDeepEqual(result.afterAttention, result.attentionUpdate);
  assert.notDeepEqual(result.output, result.mlpUpdate);
});

test('disabling residual replaces the attention signal instead of adding input', () => {
  const result = evaluatePreNormBlock({
    input: [1, 1],
    attentionGain: [0.5, 0.5],
    mlpGain: [0.2, 0.2],
    normalization: false,
    residual: false,
    mlp: false
  });
  assert.deepEqual(result.afterAttention, [0.5, 0.5]);
  assert.deepEqual(result.output, [0.5, 0.5]);
});

test('disabling MLP keeps the post-attention representation', () => {
  const result = evaluatePreNormBlock({
    input: [1, 2], attentionGain: [0.1, 0.2], mlpGain: [4, 4], normalization: false, residual: true, mlp: false
  });
  assert.deepEqual(result.output, result.afterAttention);
  assert.deepEqual(result.mlpUpdate, [0, 0]);
});
