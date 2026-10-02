export const DEFAULT_MASTERY_POLICY = Object.freeze({
  quizThreshold: 0.8,
  transferThreshold: 0.8
});

function ratio(evidence) {
  if (!evidence || !Number.isFinite(evidence.score) || !Number.isFinite(evidence.total) || evidence.total <= 0) return null;
  return evidence.score / evidence.total;
}

export function evaluateMastery(moduleState = {}, policy = DEFAULT_MASTERY_POLICY) {
  const quiz = ratio(moduleState.quiz);
  const transfer = ratio(moduleState.transfer);

  if (quiz === null && transfer === null) return 'not-started';

  const quizPass = quiz !== null && quiz >= policy.quizThreshold;
  const transferPass = transfer !== null && transfer >= policy.transferThreshold;

  if (quizPass && transferPass) return 'mastered';
  if (quizPass || transferPass) return 'evidence';
  return 'learning';
}

export function nextReviewIntervalDays(level = 0, passed = true) {
  const schedule = [1, 3, 7, 14, 30];
  if (!passed) return schedule[0];
  return schedule[Math.min(Math.max(level, 0), schedule.length - 1)];
}

export function scheduleReview({ now, level = 0, passed = true }) {
  const at = new Date(now);
  at.setUTCDate(at.getUTCDate() + nextReviewIntervalDays(level, passed));
  return at.toISOString();
}
