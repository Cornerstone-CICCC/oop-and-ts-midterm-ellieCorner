export class CartItem {
  constructor(product, quantity = 1) {
    this.id = product.id;
    this.product = product;
    this.quantity = quantity;
  }
  linePrice() {
    return this.product.price * this.quantity;
  }
}
