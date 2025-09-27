import { Component } from "../common/Component.js";
import { ProductItem } from "./ProductItem.js";

export class ProductList extends Component {
  render() {
    const { products = [], cart, wishlist } = this.props;
    const itemHtml = products
      .map((p) => new ProductItem({ product: p, cart, wishlist }).render())
      .join("");
    return `<ul class="product-grid" role="list">${itemHtml}</ul>`;
  }
}
