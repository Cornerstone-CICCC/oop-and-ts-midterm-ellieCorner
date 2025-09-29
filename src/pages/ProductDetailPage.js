import { Component } from "../common/Component.js";
import { ProductList } from "../components/ProductList.js";

export class ProductDetailPage extends Component {
  async beforeMount() {
    this.unsubscribe = this.props.productService.store.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    this.unsubscribeWishlist = this.props.wishlist?.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    await this.props.productService.ensure();
    this.setState({ refresh: Date.now() });
  }
  afterUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeWishlist) this.unsubscribeWishlist();
  }
  render() {
    const { id } = this.props.params;
    const p = this.props.productService.store.getById(Number(id));
    if (!p) return "<div>Loading...</div>";
    const relatedHtml = new ProductList({
      products: this.props.productService.store.random(4),
      cart: this.props.cartContext,
      wishlist: this.props.wishlist,
    }).render();
    const wished = this.props.wishlist.has(p.id);
    const wishLabel = wished ? "Remove from Wishlist" : "Add to Wishlist";
    return `
      <article class="product-detail" data-product-id="${p.id}">
        <div class="product-detail__grid">
          <div class="product-detail__media">
            <img src="${p.image}" alt="${
      p.title
    }" loading="lazy" width="320" height="320" />
          </div>
          <div class="product-detail__info">
            <h1 class="product-detail__title">${p.title}</h1>
            <p class="product-detail__price">$${p.price.toFixed(2)}</p>
            <p class="product-detail__description">${p.description}</p>
            <div class="product-detail__actions">
              <button
                type="button"
                class="btn btn--primary"
                data-action="pd-add-cart"
                data-id="${p.id}"
              >
                Add to Cart
              </button>
              <button
                type="button"
                class="btn btn--ghost ${wished ? "btn--active" : ""}"
                data-action="pd-toggle-wish"
                data-id="${p.id}"
              >
                ${wishLabel}
              </button>
            </div>
          </div>
        </div>
        <section class="product-detail__related">
          <h2 class="product-detail__related-title">You may also like</h2>
          ${relatedHtml}
        </section>
      </article>
    `;
  }
}
