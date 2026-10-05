import { ContentRepository } from '../../application/ports/index.mjs';

export class FetchContentRepository extends ContentRepository {
  constructor({ contentRoot, fetchImpl = globalThis.fetch } = {}) {
    super();
    if (!contentRoot) throw new Error('contentRoot is required');
    if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
    this.contentRoot = contentRoot instanceof URL ? contentRoot : new URL(String(contentRoot), globalThis.location?.href || 'http://localhost/');
    this.fetchImpl = fetchImpl.bind(globalThis);
    this.courseCache = new Map();
    this.gateCache = new Map();
    this.moduleCache = new Map();
    this.bankCache = new Map();
    this.activityCache = new Map();
  }

  async #json(relativePath) {
    const url = new URL(relativePath, this.contentRoot);
    const response = await this.fetchImpl(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content load failed: ${relativePath} (${response.status})`);
    return response.json();
  }

  async getCourse(courseId) {
    if (!this.courseCache.has(courseId)) this.courseCache.set(courseId, this.#json(`courses/${courseId}.json`));
    return structuredClone(await this.courseCache.get(courseId));
  }

  async getLearnerGate(gateId) {
    if (!this.gateCache.has(gateId)) this.gateCache.set(gateId, this.#json(`learner-gates/${gateId}.json`));
    return structuredClone(await this.gateCache.get(gateId));
  }

  async getModule(moduleId) {
    if (!this.moduleCache.has(moduleId)) this.moduleCache.set(moduleId, this.#json(`modules/${moduleId}.json`));
    return structuredClone(await this.moduleCache.get(moduleId));
  }

  async getAssessmentBank(moduleId) {
    if (!this.bankCache.has(moduleId)) this.bankCache.set(moduleId, this.#json(`assessment-banks/${moduleId}.json`));
    return structuredClone(await this.bankCache.get(moduleId));
  }

  async getActivity(activityId) {
    if (!this.activityCache.has(activityId)) this.activityCache.set(activityId, this.#json(`activities/${activityId}.json`));
    return structuredClone(await this.activityCache.get(activityId));
  }

  async getVersion() {
    return 'content-v3';
  }
}
