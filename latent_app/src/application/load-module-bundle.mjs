import { buildModuleViewModel } from './module-presenter.mjs';

export async function loadModuleBundle({ contentRepository, moduleId }) {
  if (!contentRepository) throw new TypeError('contentRepository is required');
  if (!moduleId) throw new TypeError('moduleId is required');

  const module = await contentRepository.getModule(moduleId);
  const sharedIds = [...(module.sharedActivityIds || [])];
  const sharedActivities = await Promise.all(sharedIds.map((activityId) => contentRepository.getActivity(activityId)));
  const assessmentBank = await contentRepository.getAssessmentBank(moduleId);
  const view = buildModuleViewModel(module, sharedActivities);

  return Object.freeze({ module, sharedActivities, assessmentBank, view });
}
