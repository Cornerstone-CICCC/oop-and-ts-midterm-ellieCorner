import { Emitter } from "./Emitter.js";

export class ProductStore {
  constructor() {
    this.products = [];
    this.categories = [];
    this.loading = false;
    this.error = null;
    this.emitter = new Emitter();
    this.fetched = false;
  }
  subscribe(fn) {
    return this.emitter.subscribe(fn);
  }
  notify() {
    this.emitter.emit(this.snapshot());
  }
  snapshot() {
    return {
      products: [...this.products],
      categories: [...this.categories],
      loading: this.loading,
      error: this.error,
    };
  }
  async fetchAll() {
    if (this.fetched) return;
    this.loading = true;
    this.notify();
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      this.products = data;
      this.categories = [...new Set(data.map((p) => p.category))];
      this.error = null;
      this.fetched = true;
    } catch (e) {
      this.error = e.message || "Fetch error";
    } finally {
      this.loading = false;
      this.notify();
    }
  }
  getById(id) {
    return this.products.find((p) => p.id == id);
  }
  random(n = 8) {
    if (!this.products.length) return [];
    const arr = [...this.products];
    return arr.sort(() => Math.random() - 0.5).slice(0, n);
  }
  filter({ category, q, priceRange, sort } = {}) {
    let list = [...this.products];
    if (category) list = list.filter((p) => p.category === category);
    if (q) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }
    if (priceRange) {
      const [min, max] = priceRange;
      list = list.filter((p) => p.price >= min && p.price <= max);
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "title")
      list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }
}
