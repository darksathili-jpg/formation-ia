import { LearningEventRepository } from '../../application/ports/index.mjs';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class LocalLearningEventRepository extends LearningEventRepository {
  constructor({ storage = globalThis.localStorage, key = 'latent-v3-events', maxEvents = 5000 } = {}) {
    super();
    this.storage = storage;
    this.key = key;
    this.maxEvents = maxEvents;
    this.memoryFallback = [];
  }

  readAll() {
    try {
      const raw = this.storage?.getItem(this.key);
      if (!raw) return [...this.memoryFallback];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [...this.memoryFallback];
    }
  }

  async append(event) {
    const events = this.readAll();
    events.push(clone(event));
    const trimmed = events.slice(-this.maxEvents);
    this.memoryFallback = trimmed;
    try { this.storage?.setItem(this.key, JSON.stringify(trimmed)); } catch {}
    return clone(event);
  }

  async query(filter = {}) {
    return this.readAll().filter((event) => Object.entries(filter).every(([key, value]) => value == null || event[key] === value));
  }

  async export(filter = {}) {
    return JSON.stringify(await this.query(filter), null, 2);
  }

  async count(filter = {}) {
    return (await this.query(filter)).length;
  }
}
