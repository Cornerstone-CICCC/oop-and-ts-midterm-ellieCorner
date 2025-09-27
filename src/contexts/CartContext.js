import { Emitter } from "./Emitter.js";

export class CartContext {
  constructor() {
    this.items = [];
    this.emitter = new Emitter();
  }

  subscribe(fn) {
    return this.emitter.subscribe(fn);
  }
  notify() {
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
}
