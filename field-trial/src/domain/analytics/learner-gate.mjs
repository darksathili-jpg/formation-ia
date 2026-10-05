const PACKET_VERSION = 1;

function finite(value) {
  return Number.isFinite(value) ? Number(value) : null;
}

function ratio(entry) {
  if (!entry || !Number.isFinite(entry.score) || !Number.isFinite(entry.total) || entry.total <= 0) return null;
  return Math.max(0, Math.min(1, entry.score / entry.total));
}

function median(values) {
  const clean = values.filter(Number.isFinite).map(Number).sort((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
}

function meanBoolean(values) {
  const clean = values.filter((value) => typeof value === 'boolean');
  if (!clean.length) return null;
  return clean.filter(Boolean).length / clean.length;
}

function isoMs(value) {
  const ms = Date.parse(value || '');
  return Number.isFinite(ms) ? ms : null;
}

function firstEvent(events, predicate) {
  return [...events]
    .filter(predicate)
    .map((event) => ({ event, ms: isoMs(event.at) }))
    .filter((item) => item.ms != null)
    .sort((a, b) => a.ms - b.ms)[0] || null;
}

function observationFor(observations, moduleId) {
  const value = observations?.modules?.[moduleId] || {};
  const explanationScore = finite(value.explanationScore);
  return Object.freeze({
    directHelpBeforeFirstAction: typeof value.directHelpBeforeFirstAction === 'boolean' ? value.directHelpBeforeFirstAction : null,
    explanationScore: explanationScore != null && explanationScore >= 0 && explanationScore <= 2 ? explanationScore : null,
    delayedTransferPassed: typeof value.delayedTransferPassed === 'boolean' ? value.delayedTransferPassed : null,
    criticalMisconceptionPersisted: typeof value.criticalMisconceptionPersisted === 'boolean' ? value.criticalMisconceptionPersisted : null,
    blockerSeverity: ['none', 'minor', 'major'].includes(value.blockerSeverity) ? value.blockerSeverity : null,
    note: typeof value.note === 'string' ? value.note.slice(0, 1000) : ''
  });
}

export function summarizeParticipantModule({ moduleId, events = [], progress = {}, observations = {}, meaningfulActionTypes = [] }) {
  const moduleEvents = events.filter((event) => event?.moduleId === moduleId);
  const opened = firstEvent(moduleEvents, (event) => event.type === 'module.opened');
  const meaningful = new Set(meaningfulActionTypes);
  const firstAction = firstEvent(moduleEvents, (event) => meaningful.has(event.type));
  const firstMeaningfulActionSeconds = opened && firstAction && firstAction.ms >= opened.ms
    ? (firstAction.ms - opened.ms) / 1000
    : null;
  const moduleProgress = progress?.modules?.[moduleId] || {};
  const quizRatio = ratio(moduleProgress.quiz);
  const transferRatio = ratio(moduleProgress.transfer);
  const masteryStatus = moduleProgress.mastery?.status || null;
  const completed = quizRatio != null && transferRatio != null;

  return Object.freeze({
    moduleId,
    opened: Boolean(opened),
    openedAt: opened?.event?.at || null,
    firstMeaningfulActionAt: firstAction?.event?.at || null,
    firstMeaningfulActionSeconds,
    meaningfulActionCount: moduleEvents.filter((event) => meaningful.has(event.type)).length,
    attemptCount: moduleEvents.filter((event) => event.type === 'attempt.completed').length,
    predictionCount: moduleEvents.filter((event) => event.type === 'prediction.submitted').length,
    manipulationCount: moduleEvents.filter((event) => event.type === 'manipulation.changed').length,
    quizRatio,
    transferRatio,
    masteryStatus,
    mastered: masteryStatus === 'mastered',
    completed,
    observation: observationFor(observations, moduleId)
  });
}

export function createParticipantPacket({ participantId, events = [], progress = {}, observations = {}, course, gateConfig, createdAt = new Date().toISOString() }) {
  if (!/^P-[A-Z0-9]{6,12}$/.test(participantId || '')) {
    throw new Error('participantId must be a pseudonymous code like P-A1B2C3');
  }
  if (!course?.courseId || !Array.isArray(course.moduleSequence)) throw new Error('course manifest is required');
  if (!gateConfig?.gateId || !Array.isArray(gateConfig.meaningfulActionTypes)) throw new Error('learner gate config is required');

  const modules = Object.fromEntries(course.moduleSequence.map(({ id }) => [id, summarizeParticipantModule({
    moduleId: id,
    events,
    progress,
    observations,
    meaningfulActionTypes: gateConfig.meaningfulActionTypes
  })]));
  const requiredIds = course.moduleSequence.filter((module) => module.required !== false).map((module) => module.id);
  const courseCompleted = requiredIds.every((moduleId) => modules[moduleId]?.completed);

  return Object.freeze({
    schema: 'latent-learner-gate-packet',
    packetVersion: PACKET_VERSION,
    createdAt,
    participantId,
    courseId: course.courseId,
    courseVersion: course.version,
    gateId: gateConfig.gateId,
    gateVersion: gateConfig.version,
    courseCompleted,
    modules
  });
}

function coverage(values, total, predicate = (value) => value != null) {
  return total ? values.filter(predicate).length / total : 0;
}

function moduleMetrics(packets, moduleId) {
  const rows = packets.map((packet) => packet.modules?.[moduleId]).filter(Boolean);
  const observations = rows.map((row) => row.observation || {});
  return Object.freeze({
    participants: packets.length,
    openedRate: packets.length ? rows.filter((row) => row.opened).length / packets.length : 0,
    completionRate: packets.length ? rows.filter((row) => row.completed).length / packets.length : 0,
    firstActionCoverage: coverage(rows.map((row) => row.firstMeaningfulActionSeconds), packets.length, Number.isFinite),
    medianFirstMeaningfulActionSeconds: median(rows.map((row) => row.firstMeaningfulActionSeconds)),
    quizCoverage: coverage(rows.map((row) => row.quizRatio), packets.length, Number.isFinite),
    medianQuizRatio: median(rows.map((row) => row.quizRatio)),
    transferCoverage: coverage(rows.map((row) => row.transferRatio), packets.length, Number.isFinite),
    medianTransferRatio: median(rows.map((row) => row.transferRatio)),
    masteryRate: packets.length ? rows.filter((row) => row.mastered).length / packets.length : 0,
    observerCoverage: coverage(observations.map((item) => item.explanationScore), packets.length, Number.isFinite),
    directHelpBeforeFirstActionRate: meanBoolean(observations.map((item) => item.directHelpBeforeFirstAction)),
    medianExplanationScore: median(observations.map((item) => item.explanationScore)),
    delayedTransferPassRate: meanBoolean(observations.map((item) => item.delayedTransferPassed)),
    criticalMisconceptionPersistenceRate: meanBoolean(observations.map((item) => item.criticalMisconceptionPersisted)),
    majorBlockerCount: observations.filter((item) => item.blockerSeverity === 'major').length
  });
}

function check(key, actual, operator, expected, evidenceAvailable = true) {
  if (!evidenceAvailable || actual == null || !Number.isFinite(actual)) {
    return Object.freeze({ key, state: 'missing-evidence', actual: actual ?? null, operator, expected });
  }
  const pass = operator === '<=' ? actual <= expected : actual >= expected;
  return Object.freeze({ key, state: pass ? 'pass' : 'fail', actual, operator, expected });
}

export function evaluateLearnerGate({ packets = [], course, gateConfig }) {
  if (!course?.courseId || !Array.isArray(course.moduleSequence)) throw new Error('course manifest is required');
  if (!gateConfig?.thresholds || !gateConfig?.protocol) throw new Error('learner gate config is required');

  const unique = new Map();
  for (const packet of packets) {
    if (packet?.schema !== 'latent-learner-gate-packet') continue;
    if (packet.courseId !== course.courseId || packet.gateId !== gateConfig.gateId) continue;
    if (!unique.has(packet.participantId)) unique.set(packet.participantId, packet);
  }
  const cohort = [...unique.values()];
  const participantCount = cohort.length;
  const thresholds = gateConfig.thresholds;
  const minimumParticipants = gateConfig.protocol.minimumParticipants;
  const courseCompletionRate = participantCount ? cohort.filter((packet) => packet.courseCompleted).length / participantCount : 0;
  const requiredCoverage = thresholds.moduleCompletionRate;
  const courseChecks = [
    check('minimumParticipants', participantCount, '>=', minimumParticipants, true),
    check('courseCompletionRate', courseCompletionRate, '>=', thresholds.courseCompletionRate, participantCount >= minimumParticipants)
  ];

  const modules = {};
  const allChecks = [...courseChecks];
  for (const { id } of course.moduleSequence.filter((module) => module.required !== false)) {
    const metrics = moduleMetrics(cohort, id);
    const enoughParticipants = participantCount >= minimumParticipants;
    const checks = [
      check('moduleCompletionRate', metrics.completionRate, '>=', thresholds.moduleCompletionRate, enoughParticipants),
      check('medianFirstMeaningfulActionSeconds', metrics.medianFirstMeaningfulActionSeconds, '<=', thresholds.medianFirstMeaningfulActionSecondsMax, enoughParticipants && metrics.firstActionCoverage >= requiredCoverage),
      check('directHelpBeforeFirstActionRate', metrics.directHelpBeforeFirstActionRate, '<=', thresholds.directHelpBeforeFirstActionRateMax, enoughParticipants && metrics.observerCoverage >= requiredCoverage),
      check('medianQuizRatio', metrics.medianQuizRatio, '>=', thresholds.medianQuizRatioMin, enoughParticipants && metrics.quizCoverage >= requiredCoverage),
      check('medianTransferRatio', metrics.medianTransferRatio, '>=', thresholds.medianTransferRatioMin, enoughParticipants && metrics.transferCoverage >= requiredCoverage),
      check('masteryRate', metrics.masteryRate, '>=', thresholds.masteryRateMin, enoughParticipants),
      check('medianExplanationScore', metrics.medianExplanationScore, '>=', thresholds.medianExplanationScoreMin, enoughParticipants && metrics.observerCoverage >= requiredCoverage),
      check('delayedTransferPassRate', metrics.delayedTransferPassRate, '>=', thresholds.delayedTransferPassRateMin, enoughParticipants && metrics.observerCoverage >= requiredCoverage),
      check('criticalMisconceptionPersistenceRate', metrics.criticalMisconceptionPersistenceRate, '<=', thresholds.criticalMisconceptionPersistenceRateMax, enoughParticipants && metrics.observerCoverage >= requiredCoverage),
      check('majorBlockerCount', metrics.majorBlockerCount, '<=', thresholds.majorBlockerCountMax, enoughParticipants && metrics.observerCoverage >= requiredCoverage)
    ];
    modules[id] = Object.freeze({ metrics, checks });
    allChecks.push(...checks.map((entry) => ({ ...entry, moduleId: id })));
  }

  const hasMissing = allChecks.some((entry) => entry.state === 'missing-evidence');
  const hasFail = allChecks.some((entry) => entry.state === 'fail');
  const decision = hasMissing
    ? gateConfig.decisionPolicy.insufficientEvidence
    : hasFail
      ? gateConfig.decisionPolicy.thresholdFailure
      : gateConfig.decisionPolicy.allThresholdsMet;

  return Object.freeze({
    gateId: gateConfig.gateId,
    participantCount,
    minimumParticipants,
    courseCompletionRate,
    decision,
    eligibleForHumanApproval: decision === gateConfig.decisionPolicy.allThresholdsMet,
    p2Unlocked: false,
    humanApprovalRequired: true,
    courseChecks,
    modules,
    failedChecks: allChecks.filter((entry) => entry.state === 'fail'),
    missingEvidence: allChecks.filter((entry) => entry.state === 'missing-evidence')
  });
}
