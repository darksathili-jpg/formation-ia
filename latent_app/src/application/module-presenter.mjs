function requireArray(value, name) {
  if (!Array.isArray(value)) throw new TypeError(`${name} must be an array`);
  return value;
}

export function buildModuleViewModel(module) {
  if (!module || typeof module !== 'object') throw new TypeError('module must be an object');
  if (!module.moduleId || !module.title) throw new Error('moduleId and title are required');

  const activities = requireArray(module.activities, 'activities');
  const sections = requireArray(module.sections, 'sections');
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));

  if (activityById.size !== activities.length) throw new Error('duplicate activity id');

  const sectionModels = sections.map((section, index) => ({
    id: section.id,
    ordinal: index + 1,
    title: section.title,
    activities: section.activityIds.map((activityId) => {
      const activity = activityById.get(activityId);
      if (!activity) throw new Error(`unknown activity ${activityId} in section ${section.id}`);
      return activity;
    })
  }));

  const assessment = module.assessment || {};
  for (const activityId of [assessment.quizActivityId, assessment.transferActivityId].filter(Boolean)) {
    if (!activityById.has(activityId)) throw new Error(`assessment references unknown activity ${activityId}`);
  }

  return Object.freeze({
    id: module.moduleId,
    version: module.version,
    title: module.title,
    status: module.status,
    track: module.audience?.track || 'discover',
    prerequisites: [...(module.audience?.prerequisites || [])],
    estimatedMinutes: module.estimatedMinutes ?? null,
    outcomes: [...(module.outcomes || [])],
    evidence: [...(module.evidence || [])],
    sections: sectionModels,
    assessment,
    pedagogy: module.pedagogy || {},
    references: [...(module.references || [])],
    activityById
  });
}
