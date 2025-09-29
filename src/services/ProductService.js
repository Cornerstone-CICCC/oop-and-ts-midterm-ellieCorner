import { Product } from "../models/Product.js";

export class ProductService {
  constructor(store) {
    this.store = store;
  }
  async ensure(options = {}) {
    const { limit } = options || {};
    if (typeof limit === "number") {
      await this.store.ensureMinimum(limit);
      return;
    }
    await this.store.fetchAll();
  }
  async ensureAll() {
    await this.store.fetchAll();
  }
  async fetchMore(increment) {
    await this.store.fetchNext(increment);
  }
  async getRandom(n) {
    await this.ensureAll();
    return this.store.random(n).map((r) => new Product(r));
  }
  async getById(id) {
    let raw = this.store.getById(id);
    if (!raw) {
      await this.ensureAll();
      raw = this.store.getById(id);
    }
    return raw ? new Product(raw) : null;
  }
  async list(opts) {
    await this.ensureAll();
    return this.store.filter(opts).map((r) => new Product(r));
  }
  async fetchCategories() {
    if (this.store.categories.length) {
      return [...this.store.categories];
    }
    try {
      const res = await fetch("https://fakestoreapi.com/products/categories");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        this.store.categories = [...data];
        this.store.notify();
        return data;
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
    return [];
  }
  categories() {
    return [...this.store.categories];
  }
}
