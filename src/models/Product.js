export class Product {
  constructor(raw) {
    this.id = raw.id;
    this.title = raw.title;
    this.price = raw.price;
    this.description = raw.description;
    this.category = raw.category;
    this.image = raw.image;
    this.rating = raw.rating || { rate: 0, count: 0 };
  }
  shortDescription(len = 100) {
    if (!this.description) return "";
    return this.description.length > len
      ? this.description.slice(0, len) + "…"
      : this.description;
  }
}
