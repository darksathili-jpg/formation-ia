function assertVector(vector, label) {
  if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(Number(value)))) {
    throw new TypeError(`${label} must be a non-empty numeric vector`);
  }
  return vector.map(Number);
}

export function dotProduct(a, b) {
  const left = assertVector(a, 'a');
  const right = assertVector(b, 'b');
  if (left.length !== right.length) throw new RangeError('vectors must have the same dimension');
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function scaleAttentionScore(score, dk) {
  const dimension = Number(dk);
  if (!Number.isInteger(dimension) || dimension <= 0) throw new RangeError('dk must be a positive integer');
  return Number(score) / Math.sqrt(dimension);
}

export function stableSoftmax(scores) {
  if (!Array.isArray(scores) || scores.length === 0) throw new TypeError('scores must be a non-empty array');
  const numeric = scores.map(Number);
  if (numeric.some((value) => Number.isNaN(value))) throw new TypeError('scores must be numeric');
  const finite = numeric.filter(Number.isFinite);
  if (!finite.length) throw new RangeError('at least one score must remain unmasked');
  const max = Math.max(...finite);
  const exponentials = numeric.map((value) => Number.isFinite(value) ? Math.exp(value - max) : 0);
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

export function applyCausalMask(scores, queryIndex) {
  if (!Array.isArray(scores)) throw new TypeError('scores must be an array');
  if (!Number.isInteger(queryIndex) || queryIndex < 0 || queryIndex >= scores.length) throw new RangeError('queryIndex out of range');
  return scores.map((score, index) => index > queryIndex ? Number.NEGATIVE_INFINITY : Number(score));
}

export function weightedSum(values, weights) {
  if (!Array.isArray(values) || values.length === 0 || !Array.isArray(weights) || values.length !== weights.length) {
    throw new RangeError('values and weights must have the same non-zero length');
  }
  const vectors = values.map((vector, index) => assertVector(vector, `values[${index}]`));
  const dimension = vectors[0].length;
  if (vectors.some((vector) => vector.length !== dimension)) throw new RangeError('all value vectors must have the same dimension');
  const numericWeights = weights.map(Number);
  return Array.from({ length: dimension }, (_, dimensionIndex) =>
    vectors.reduce((sum, vector, index) => sum + vector[dimensionIndex] * numericWeights[index], 0)
  );
}

export function evaluateAttention({ query, keys, values, queryIndex = 0, causal = false, scaling = true }) {
  const q = assertVector(query, 'query');
  if (!Array.isArray(keys) || !Array.isArray(values) || keys.length !== values.length || keys.length === 0) {
    throw new RangeError('keys and values must have the same non-zero length');
  }
  const normalizedKeys = keys.map((key, index) => {
    const vector = assertVector(key, `keys[${index}]`);
    if (vector.length !== q.length) throw new RangeError('query and keys must have the same dimension');
    return vector;
  });
  if (!Number.isInteger(queryIndex) || queryIndex < 0 || queryIndex >= normalizedKeys.length) throw new RangeError('queryIndex out of range');

  const rawScores = normalizedKeys.map((key) => dotProduct(q, key));
  const scaledScores = scaling ? rawScores.map((score) => scaleAttentionScore(score, q.length)) : [...rawScores];
  const usedScores = causal ? applyCausalMask(scaledScores, queryIndex) : [...scaledScores];
  const weights = stableSoftmax(usedScores);
  const output = weightedSum(values, weights);

  return Object.freeze({
    query: [...q],
    queryIndex,
    dimension: q.length,
    causal: Boolean(causal),
    scaling: Boolean(scaling),
    rawScores,
    scaledScores,
    usedScores,
    weights,
    output
  });
}
