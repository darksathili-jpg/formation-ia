function assertFiniteArray(values, label = 'values') {
  if (!Array.isArray(values) || values.length < 1 || values.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${label} must be a non-empty array of finite numbers`);
  }
}

function assertProbability(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${label} must be in [0,1]`);
}

export function softmax(logits, temperature = 1) {
  assertFiniteArray(logits, 'logits');
  if (!Number.isFinite(temperature) || temperature <= 0) throw new RangeError('temperature must be > 0');
  const scaled = logits.map((value) => value / temperature);
  const maximum = Math.max(...scaled);
  const exps = scaled.map((value) => Math.exp(value - maximum));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

export function renormalize(probabilities) {
  assertFiniteArray(probabilities, 'probabilities');
  probabilities.forEach((value, index) => assertProbability(value, `probabilities[${index}]`));
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  if (total <= 0) throw new RangeError('at least one probability must be positive');
  return probabilities.map((value) => value / total);
}

export function topKMask(probabilities, k) {
  assertFiniteArray(probabilities, 'probabilities');
  if (!Number.isInteger(k) || k < 1 || k > probabilities.length) throw new RangeError('k must be an integer between 1 and vocabulary size');
  const ranked = probabilities.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value || a.index - b.index);
  const keep = new Set(ranked.slice(0, k).map((item) => item.index));
  return probabilities.map((_, index) => keep.has(index));
}

export function topPMask(probabilities, p) {
  assertFiniteArray(probabilities, 'probabilities');
  if (!Number.isFinite(p) || p <= 0 || p > 1) throw new RangeError('p must be in ]0,1]');
  const ranked = probabilities.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value || a.index - b.index);
  const keep = new Set();
  let cumulative = 0;
  for (const item of ranked) {
    keep.add(item.index);
    cumulative += item.value;
    if (cumulative >= p) break;
  }
  return probabilities.map((_, index) => keep.has(index));
}

export function filterDistribution(probabilities, { filter = 'none', topK = 1, topP = 0.9 } = {}) {
  assertFiniteArray(probabilities, 'probabilities');
  const base = renormalize(probabilities);
  let mask;
  if (filter === 'none') mask = base.map(() => true);
  else if (filter === 'topk') mask = topKMask(base, topK);
  else if (filter === 'topp') mask = topPMask(base, topP);
  else throw new RangeError(`unknown filter: ${filter}`);
  const filtered = base.map((value, index) => mask[index] ? value : 0);
  return Object.freeze({ mask: Object.freeze(mask), probabilities: Object.freeze(renormalize(filtered)) });
}

export function greedyIndex(probabilities) {
  const normalized = renormalize(probabilities);
  let best = 0;
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index] > normalized[best]) best = index;
  }
  return best;
}

export function sampleIndex(probabilities, randomValue) {
  const normalized = renormalize(probabilities);
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) throw new RangeError('randomValue must be in [0,1[');
  let cumulative = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    cumulative += normalized[index];
    if (randomValue < cumulative) return index;
  }
  return normalized.length - 1;
}

export function randomFromSeed(seed, step = 0) {
  if (!Number.isInteger(seed) || !Number.isInteger(step) || step < 0) throw new TypeError('seed and step must be integers, step >= 0');
  let value = (seed + Math.imul(step + 1, 0x9E3779B1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

export function decodeStep({ tokens, logits, temperature = 1, strategy = 'greedy', filter = 'none', topK = 1, topP = 0.9, randomValue = 0.5 }) {
  if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length !== logits?.length) throw new TypeError('tokens and logits must have the same non-zero length');
  const baseProbabilities = softmax(logits, temperature);
  const filtered = filterDistribution(baseProbabilities, { filter, topK, topP });
  let selectedIndex;
  if (strategy === 'greedy') selectedIndex = greedyIndex(filtered.probabilities);
  else if (strategy === 'sample') selectedIndex = sampleIndex(filtered.probabilities, randomValue);
  else throw new RangeError(`unknown strategy: ${strategy}`);
  return Object.freeze({
    tokens: Object.freeze([...tokens]),
    logits: Object.freeze([...logits]),
    temperature,
    strategy,
    filter,
    baseProbabilities,
    mask: filtered.mask,
    probabilities: filtered.probabilities,
    selectedIndex,
    selectedToken: tokens[selectedIndex]
  });
}

export function advanceAutoregressive({ graph, stateId = 'start', context = [], temperature = 1, strategy = 'greedy', filter = 'none', topK = 1, topP = 0.9, randomValue = 0.5 }) {
  const node = graph?.[stateId];
  if (!node || !Array.isArray(node.tokens) || !Array.isArray(node.logits) || !Array.isArray(node.nextStates)) throw new TypeError(`invalid autoregressive node: ${stateId}`);
  if (node.tokens.length !== node.logits.length || node.tokens.length !== node.nextStates.length) throw new TypeError(`node ${stateId} arrays must have identical lengths`);
  const decision = decodeStep({ tokens: node.tokens, logits: node.logits, temperature, strategy, filter, topK, topP, randomValue });
  const nextStateId = node.nextStates[decision.selectedIndex];
  if (nextStateId != null && !graph[nextStateId]) throw new TypeError(`node ${stateId} references missing next state ${nextStateId}`);
  return Object.freeze({
    stateId,
    nextStateId,
    contextBefore: Object.freeze([...context]),
    contextAfter: Object.freeze([...context, decision.selectedToken]),
    decision
  });
}
