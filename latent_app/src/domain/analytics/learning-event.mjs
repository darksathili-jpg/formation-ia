const ALLOWED_TYPES = new Set([
  'module.opened',
  'activity.started',
  'prediction.submitted',
  'manipulation.changed',
  'feedback.shown',
  'hint.requested',
  'attempt.completed',
  'explanation.self_checked',
  'quiz.answered',
  'transfer.completed',
  'mastery.changed',
  'review.completed'
]);

export function createLearningEvent({
  id,
  at,
  profileId,
  sessionId,
  courseId,
  moduleId,
  activityId = null,
  type,
  payload = {},
  contentVersion,
  appVersion
}) {
  if (!ALLOWED_TYPES.has(type)) throw new Error(`Unsupported learning event type: ${type}`);
  for (const [name, value] of Object.entries({ id, at, profileId, sessionId, courseId, moduleId, type, contentVersion, appVersion })) {
    if (!value) throw new Error(`Missing learning event field: ${name}`);
  }

  return Object.freeze({
    id,
    at,
    profileId,
    sessionId,
    courseId,
    moduleId,
    activityId,
    type,
    payload: structuredClone(payload),
    contentVersion,
    appVersion
  });
}

export function isLearningEventType(type) {
  return ALLOWED_TYPES.has(type);
}
