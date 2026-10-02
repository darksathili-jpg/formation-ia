import { ProgressRepository } from '../../application/ports/index.mjs';

const EMPTY_STATE = Object.freeze({ version: 1, modules: {} });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class LocalProgressRepository extends ProgressRepository {
  constructor({ storage = globalThis.localStorage, key = 'latent-v3-progress' } = {}) {
    super();
    this.storage = storage;
    this.key = key;
    this.memoryFallback = clone(EMPTY_STATE);
  }

  async loadLearnerState(_profileId = 'local-profile') {
    try {
      const raw = this.storage?.getItem(this.key);
      if (!raw) return clone(this.memoryFallback);
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : clone(EMPTY_STATE);
    } catch {
      return clone(this.memoryFallback);
    }
  }

  async saveLearnerState(_profileId, state) {
    const snapshot = clone(state);
    this.memoryFallback = snapshot;
    try {
      this.storage?.setItem(this.key, JSON.stringify(snapshot));
    } catch {
      // Memory fallback keeps the application usable when storage is blocked.
    }
    return snapshot;
  }

  async resetLearnerState(_profileId = 'local-profile') {
    this.memoryFallback = clone(EMPTY_STATE);
    try { this.storage?.removeItem(this.key); } catch {}
    return clone(this.memoryFallback);
  }
}
