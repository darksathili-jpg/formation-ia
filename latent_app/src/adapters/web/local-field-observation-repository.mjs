import { FieldObservationRepository } from '../../application/ports/index.mjs';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class LocalFieldObservationRepository extends FieldObservationRepository {
  constructor({ storage = globalThis.localStorage, keyPrefix = 'latent-v3-field-observations:' } = {}) {
    super();
    this.storage = storage;
    this.keyPrefix = keyPrefix;
    this.memoryFallback = new Map();
  }

  key(gateId) {
    return `${this.keyPrefix}${gateId}`;
  }

  async load(gateId) {
    const key = this.key(gateId);
    try {
      const raw = this.storage?.getItem(key);
      if (!raw) return clone(this.memoryFallback.get(key) || { modules: {} });
      const parsed = JSON.parse(raw);
      return clone(parsed && typeof parsed === 'object' ? parsed : { modules: {} });
    } catch {
      return clone(this.memoryFallback.get(key) || { modules: {} });
    }
  }

  async save(gateId, value) {
    const key = this.key(gateId);
    const safe = clone(value && typeof value === 'object' ? value : { modules: {} });
    safe.modules ||= {};
    this.memoryFallback.set(key, safe);
    try { this.storage?.setItem(key, JSON.stringify(safe)); } catch {}
    return clone(safe);
  }
}
