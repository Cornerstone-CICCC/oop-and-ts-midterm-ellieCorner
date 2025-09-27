export class Emitter {
  constructor() {
    this.listeners = new Set();
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(p) {
    this.listeners.forEach((l) => l(p));
  }
}
