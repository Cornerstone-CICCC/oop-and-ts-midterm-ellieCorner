import { Emitter } from "./Emitter.js";

export class CartContext {
  constructor() {
    this.items = [];
    this.emitter = new Emitter();
    this.storageKey = "cart-items";
    this.handleStorage = this.handleStorage.bind(this);
    this.load();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorage);
    }
  }

  subscribe(fn) {
    return this.emitter.subscribe(fn);
  }
  notify() {
    this.persist();
    this.emitter.emit(this.snapshot());
  }

  snapshot() {
    return {
      items: [...this.items],
      totalItems: this.totalItems(),
      totalPrice: this.totalPrice(),
    };
  }

  findIndex(id) {
    return this.items.findIndex((i) => i.id === id);
  }

  addProduct(product, qty = 1) {
    const idx = this.findIndex(product.id);
    if (idx === -1) {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: qty,
      });
    } else {
      this.items[idx].quantity += qty;
    }
    this.notify();
  }

  updateQuantity(id, delta) {
    const idx = this.findIndex(id);
    if (idx === -1) return;
    this.items[idx].quantity += delta;
    if (this.items[idx].quantity <= 0) this.items.splice(idx, 1);
    this.notify();
  }

  setQuantity(id, qty) {
    const idx = this.findIndex(id);
    if (idx === -1) return;
    if (qty <= 0) this.items.splice(idx, 1);
    else this.items[idx].quantity = qty;
    this.notify();
  }

  removeProduct(id) {
    const idx = this.findIndex(id);
    if (idx > -1) {
      this.items.splice(idx, 1);
      this.notify();
    }
  }

  clear() {
    this.items = [];
    this.notify();
  }

  totalItems() {
    return this.items.reduce((a, c) => a + c.quantity, 0);
  }
  totalPrice() {
    return this.items.reduce((a, c) => a + c.price * c.quantity, 0);
  }

  load() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      this.items = parsed
        .map((item) => ({
          id: item.id,
          title: item.title,
          price: Number(item.price) || 0,
          image: item.image,
          quantity: Number(item.quantity) || 0,
        }))
        .filter((item) => item.id != null && item.quantity > 0);
    } catch (err) {
      console.warn("[CartContext] Failed to load cart", err);
      this.items = [];
    }
  }

  persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (err) {
      console.warn("[CartContext] Failed to persist cart", err);
    }
  }

  handleStorage(event) {
    if (event.key !== this.storageKey) return;
    this.load();
    this.emitter.emit(this.snapshot());
  }
}
