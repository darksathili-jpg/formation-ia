export class ContentRepository {
  async getCourse(_courseId) { throw new Error('Not implemented'); }
  async getModule(_moduleId) { throw new Error('Not implemented'); }
  async getActivity(_activityId) { throw new Error('Not implemented'); }
  async getAssessmentBank(_moduleId) { throw new Error('Not implemented'); }
  async listModules() { throw new Error('Not implemented'); }
  async getVersion() { throw new Error('Not implemented'); }
}

export class ProgressRepository {
  async loadLearnerState(_profileId) { throw new Error('Not implemented'); }
  async saveLearnerState(_profileId, _state) { throw new Error('Not implemented'); }
  async resetLearnerState(_profileId) { throw new Error('Not implemented'); }
}

export class LearningEventRepository {
  async append(_event) { throw new Error('Not implemented'); }
  async query(_filter = {}) { throw new Error('Not implemented'); }
  async count(_filter = {}) { throw new Error('Not implemented'); }
  async export(_filter = {}) { throw new Error('Not implemented'); }
}

export class Clock {
  now() { return new Date(); }
}

export class ImportExportPort {
  async exportLearningPackage(_payload) { throw new Error('Not implemented'); }
  async importLearningPackage() { throw new Error('Not implemented'); }
}

export class ExternalLinkPort {
  async openTrustedUrl(_url) { throw new Error('Not implemented'); }
}
