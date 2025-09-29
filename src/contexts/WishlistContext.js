import { Emitter } from "./Emitter.js";

export class WishlistContext {
  constructor() {
    this.ids = new Set();
    this.emitter = new Emitter();
    this.storageKey = "wishlist";
    this.handleStorage = this.handleStorage.bind(this);
    this.load();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorage);
    }
  }
  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.ids = new Set(JSON.parse(raw));
      }
    } catch {}
  }
  persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.ids]));
    } catch {}
  }
  subscribe(fn) {
    return this.emitter.subscribe(fn);
  }
  notify() {
    this.emitter.emit(this.snapshot());
  }
  snapshot() {
    return { ids: new Set(this.ids), count: this.ids.size };
  }
  toggle(id) {
    if (this.ids.has(id)) this.ids.delete(id);
    else this.ids.add(id);
    this.persist();
    this.notify();
  }
  has(id) {
    return this.ids.has(id);
  }
  clear() {
    this.ids.clear();
    this.persist();
    this.notify();
  }

  handleStorage(event) {
    if (event.key !== this.storageKey) return;
    this.load();
    this.notify();
  }
}
