function assertVector(name, vector) {
  if (!Array.isArray(vector) || !vector.length || vector.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${name} must be a non-empty numeric vector`);
  }
}

function assertSameLength(aName, a, bName, b) {
  assertVector(aName, a);
  assertVector(bName, b);
  if (a.length !== b.length) throw new RangeError(`${aName} and ${bName} must have the same dimension`);
}

export function addVectors(a, b) {
  assertSameLength('a', a, 'b', b);
  return a.map((value, index) => value + b[index]);
}

export function rmsNormalize(vector, epsilon = 1e-8) {
  assertVector('vector', vector);
  if (!Number.isFinite(epsilon) || epsilon <= 0) throw new RangeError('epsilon must be > 0');
  const meanSquare = vector.reduce((sum, value) => sum + value * value, 0) / vector.length;
  const scale = Math.sqrt(meanSquare + epsilon);
  return vector.map((value) => value / scale);
}

function elementwiseGain(vector, gain) {
  assertSameLength('vector', vector, 'gain', gain);
  return vector.map((value, index) => value * gain[index]);
}

function tanhVector(vector) {
  return vector.map((value) => Math.tanh(value));
}

export function evaluatePreNormBlock({
  input,
  attentionGain,
  mlpGain,
  normalization = true,
  residual = true,
  mlp = true
}) {
  assertSameLength('input', input, 'attentionGain', attentionGain);
  assertSameLength('input', input, 'mlpGain', mlpGain);

  const norm1 = normalization ? rmsNormalize(input) : [...input];
  const attentionUpdate = elementwiseGain(norm1, attentionGain);
  const afterAttention = residual ? addVectors(input, attentionUpdate) : [...attentionUpdate];
  const norm2 = normalization ? rmsNormalize(afterAttention) : [...afterAttention];
  const mlpUpdate = mlp ? tanhVector(elementwiseGain(norm2, mlpGain)) : new Array(input.length).fill(0);
  const output = mlp
    ? (residual ? addVectors(afterAttention, mlpUpdate) : [...mlpUpdate])
    : [...afterAttention];

  return Object.freeze({
    architecture: 'didactic-pre-norm',
    normalization: Boolean(normalization),
    residual: Boolean(residual),
    mlp: Boolean(mlp),
    input: Object.freeze([...input]),
    norm1: Object.freeze(norm1),
    attentionUpdate: Object.freeze(attentionUpdate),
    afterAttention: Object.freeze(afterAttention),
    norm2: Object.freeze(norm2),
    mlpUpdate: Object.freeze(mlpUpdate),
    output: Object.freeze(output)
  });
}
