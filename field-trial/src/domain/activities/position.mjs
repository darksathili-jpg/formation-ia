function assertVector(vector) {
  if (!Array.isArray(vector) || !vector.length || vector.length % 2 !== 0 || vector.some((value) => !Number.isFinite(value))) {
    throw new TypeError('vector must be a non-empty even-length numeric vector');
  }
}

export function rotatePair([x, y], angle) {
  if (![x, y, angle].every(Number.isFinite)) throw new TypeError('rotatePair expects finite numbers');
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - y * sin, x * sin + y * cos];
}

export function applyAbsolutePosition(vector, position, scale = 0.1) {
  assertVector(vector);
  if (!Number.isInteger(position) || position < 0) throw new RangeError('position must be a non-negative integer');
  if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('scale must be > 0');
  return vector.map((value, index) => value + (index % 2 === 0 ? position * scale : -position * scale));
}

export function applyRoPESimplified(vector, position, theta = 0.5) {
  assertVector(vector);
  if (!Number.isInteger(position) || position < 0) throw new RangeError('position must be a non-negative integer');
  if (!Number.isFinite(theta) || theta <= 0) throw new RangeError('theta must be > 0');
  const output = [];
  for (let i = 0; i < vector.length; i += 2) {
    const frequency = theta / (i / 2 + 1);
    output.push(...rotatePair([vector[i], vector[i + 1]], position * frequency));
  }
  return output;
}

export function representAtPosition({ tokenId, vector, position, mode = 'rope' }) {
  assertVector(vector);
  const positioned = mode === 'none'
    ? [...vector]
    : mode === 'absolute'
      ? applyAbsolutePosition(vector, position)
      : mode === 'rope'
        ? applyRoPESimplified(vector, position)
        : (() => { throw new RangeError(`unsupported position mode: ${mode}`); })();

  return Object.freeze({
    tokenId,
    position,
    mode,
    base: Object.freeze([...vector]),
    positioned: Object.freeze(positioned)
  });
}
