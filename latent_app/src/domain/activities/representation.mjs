function asVector(value, name = 'vector') {
  if (!Array.isArray(value) || !value.length) throw new TypeError(`${name} must be a non-empty array`);
  const vector = value.map(Number);
  if (vector.some((item) => !Number.isFinite(item))) throw new TypeError(`${name} must contain only finite numbers`);
  return vector;
}

export function dotProduct(left, right) {
  const a = asVector(left, 'left');
  const b = asVector(right, 'right');
  if (a.length !== b.length) throw new RangeError('vectors must have the same dimension');
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function vectorNorm(vector) {
  const values = asVector(vector);
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

export function cosineSimilarity(left, right) {
  const a = asVector(left, 'left');
  const b = asVector(right, 'right');
  if (a.length !== b.length) throw new RangeError('vectors must have the same dimension');
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) {
    return Object.freeze({ defined: false, value: null, reason: 'zero-vector' });
  }
  return Object.freeze({
    defined: true,
    value: dotProduct(a, b) / (normA * normB),
    reason: null
  });
}

export function resolveTokenRepresentation(token, vocabulary, embeddings) {
  if (!vocabulary || typeof vocabulary !== 'object') throw new TypeError('vocabulary must be an object');
  if (!embeddings || typeof embeddings !== 'object') throw new TypeError('embeddings must be an object');
  if (!Object.prototype.hasOwnProperty.call(vocabulary, token)) throw new RangeError(`unknown token: ${token}`);
  const id = vocabulary[token];
  if (!Number.isInteger(id) || id < 0) throw new TypeError(`invalid token id for ${token}`);
  if (!Object.prototype.hasOwnProperty.call(embeddings, id)) throw new RangeError(`missing embedding for token id ${id}`);
  const vector = asVector(embeddings[id], `embedding ${id}`);
  return Object.freeze({ token, id, vector: Object.freeze([...vector]) });
}
