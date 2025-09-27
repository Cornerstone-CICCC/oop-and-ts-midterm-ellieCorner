import { Emitter } from "./Emitter.js";

export class WishlistContext {
  constructor() {
    this.ids = new Set();
    this.emitter = new Emitter();
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem("wishlist");
      if (raw) {
        this.ids = new Set(JSON.parse(raw));
      }
    } catch {}
  }
  persist() {
    try {
      localStorage.setItem("wishlist", JSON.stringify([...this.ids]));
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
}
