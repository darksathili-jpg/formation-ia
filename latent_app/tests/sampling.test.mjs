import test from 'node:test';
import assert from 'node:assert/strict';
import {
  softmax, topKMask, topPMask, filterDistribution, greedyIndex,
  sampleIndex, randomFromSeed, decodeStep, advanceAutoregressive
} from '../src/domain/activities/sampling.mjs';

const approx = (a, b, epsilon = 1e-9) => Math.abs(a - b) < epsilon;

test('softmax turns logits into a normalized distribution', () => {
  const probs = softmax([2, 1, 0], 1);
  assert.ok(approx(probs.reduce((a, b) => a + b, 0), 1));
  assert.ok(probs[0] > probs[1] && probs[1] > probs[2]);
  assert.ok(Math.abs(probs[0] - 0.6652409558) < 1e-6);
});

test('temperature below one sharpens and above one flattens without changing argmax', () => {
  const low = softmax([2, 1, 0], 0.5);
  const base = softmax([2, 1, 0], 1);
  const high = softmax([2, 1, 0], 2);
  assert.ok(low[0] > base[0] && base[0] > high[0]);
  assert.equal(greedyIndex(low), 0);
  assert.equal(greedyIndex(high), 0);
});

test('top-k keeps exactly k highest candidates', () => {
  assert.deepEqual(topKMask([0.5, 0.3, 0.15, 0.05], 2), [true, true, false, false]);
});

test('top-p keeps the smallest ranked prefix reaching cumulative mass p', () => {
  assert.deepEqual(topPMask([0.55, 0.25, 0.15, 0.05], 0.7), [true, true, false, false]);
  assert.deepEqual(topPMask([0.55, 0.25, 0.15, 0.05], 0.9), [true, true, true, false]);
});

test('filtered distribution renormalizes remaining candidates', () => {
  const result = filterDistribution([0.5, 0.3, 0.2], { filter: 'topk', topK: 2 });
  assert.deepEqual(result.mask, [true, true, false]);
  assert.ok(approx(result.probabilities[0], 0.625));
  assert.ok(approx(result.probabilities[1], 0.375));
  assert.equal(result.probabilities[2], 0);
});

test('greedy is deterministic while sampling follows weighted intervals', () => {
  const probs = [0.6, 0.3, 0.1];
  assert.equal(greedyIndex(probs), 0);
  assert.equal(sampleIndex(probs, 0.1), 0);
  assert.equal(sampleIndex(probs, 0.7), 1);
  assert.equal(sampleIndex(probs, 0.95), 2);
});

test('seeded pseudo-random values are deterministic and bounded', () => {
  const a = randomFromSeed(17, 3);
  const b = randomFromSeed(17, 3);
  assert.equal(a, b);
  assert.ok(a >= 0 && a < 1);
  assert.notEqual(randomFromSeed(17, 3), randomFromSeed(17, 4));
});

test('decodeStep preserves the distinction logits, probabilities, filter and decision', () => {
  const result = decodeStep({
    tokens: ['chat', 'chien', 'table'], logits: [2, 1, 0], temperature: 1,
    strategy: 'greedy', filter: 'topp', topP: 0.8
  });
  assert.deepEqual(result.logits, [2, 1, 0]);
  assert.deepEqual(result.mask, [true, true, false]);
  assert.equal(result.selectedToken, 'chat');
  assert.ok(approx(result.probabilities.reduce((a, b) => a + b, 0), 1));
});

test('low temperature can reinforce a dominant false candidate but never verifies truth', () => {
  const low = decodeStep({ tokens: ['faux', 'vrai', 'incertain'], logits: [3.2, 2, 1], temperature: 0.3, strategy: 'greedy' });
  const high = decodeStep({ tokens: ['faux', 'vrai', 'incertain'], logits: [3.2, 2, 1], temperature: 1.5, strategy: 'greedy' });
  assert.equal(low.selectedToken, 'faux');
  assert.equal(high.selectedToken, 'faux');
  assert.ok(low.baseProbabilities[0] > high.baseProbabilities[0]);
  assert.equal('truthVerified' in low, false);
});

test('autoregressive step appends the selected token and changes state', () => {
  const graph = {
    start: { tokens: [' calcule', ' choisit', ' hésite'], logits: [2, 1, 0], nextStates: ['calc', 'choice', 'hesitate'] },
    calc: { tokens: [' une', ' vite', '.'], logits: [2, 0, -1], nextStates: [null, null, null] },
    choice: { tokens: [' un', ' deux', '.'], logits: [0, 2, -1], nextStates: [null, null, null] },
    hesitate: { tokens: [' encore', '.', ' non'], logits: [0, 2, 1], nextStates: [null, null, null] }
  };
  const step = advanceAutoregressive({ graph, context: ['Le modèle'], strategy: 'greedy' });
  assert.equal(step.decision.selectedToken, ' calcule');
  assert.equal(step.nextStateId, 'calc');
  assert.deepEqual(step.contextAfter, ['Le modèle', ' calcule']);
});

test('invalid temperatures, filters and graph references fail loudly', () => {
  assert.throws(() => softmax([1, 2], 0));
  assert.throws(() => filterDistribution([0.5, 0.5], { filter: 'mystery' }));
  assert.throws(() => advanceAutoregressive({ graph: { start: { tokens: ['a'], logits: [1], nextStates: ['missing'] } } }));
});
