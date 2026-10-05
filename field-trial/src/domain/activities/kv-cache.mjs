function nonNegativeInteger(name, value) {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative integer`);
}

export function evaluateKvCache({ pastTokenCount, newTokenCount = 1, vectorsPerToken = 2 }) {
  nonNegativeInteger('pastTokenCount', pastTokenCount);
  nonNegativeInteger('newTokenCount', newTokenCount);
  if (!Number.isInteger(vectorsPerToken) || vectorsPerToken < 1) throw new RangeError('vectorsPerToken must be >= 1');

  const recomputedWithoutCache = pastTokenCount + newTokenCount;
  const computedWithCache = newTokenCount;
  const reusedPastPositions = pastTokenCount;
  const storedVectors = pastTokenCount * vectorsPerToken;
  const computeSaved = Math.max(0, recomputedWithoutCache - computedWithCache);

  return Object.freeze({
    pastTokenCount,
    newTokenCount,
    vectorsPerToken,
    recomputedWithoutCache,
    computedWithCache,
    reusedPastPositions,
    storedVectors,
    computeSaved,
    tradesComputeForMemory: storedVectors > 0 && computeSaved > 0,
    isPersistentUserMemory: false,
    changesModelWeights: false
  });
}
