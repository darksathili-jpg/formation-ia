export function evaluateContextBudget(tokenCount, limit) {
  if (!Number.isInteger(tokenCount) || tokenCount < 0) throw new RangeError('tokenCount must be a non-negative integer');
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit must be a positive integer');

  const used = Math.min(tokenCount, limit);
  const overflow = Math.max(0, tokenCount - limit);
  const available = Math.max(0, limit - tokenCount);

  return Object.freeze({
    limit,
    total: tokenCount,
    used,
    available,
    overflow,
    withinBudget: overflow === 0,
    ratio: tokenCount === 0 ? 0 : used / limit
  });
}
