import { Component } from "../common/Component.js";
import { ProductList } from "../components/ProductList.js";

export class WishlistPage extends Component {
  async beforeMount() {
    this.unsubscribeStore = this.props.productService.store.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    this.unsubscribeWishlist = this.props.wishlist.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    await this.props.productService.ensure();
    this.setState({ refresh: Date.now() });
  }
  afterUnmount() {
    if (this.unsubscribeStore) this.unsubscribeStore();
    if (this.unsubscribeWishlist) this.unsubscribeWishlist();
  }
  render() {
    const ids = [...this.props.wishlist.ids];
    const all = this.props.productService.store.products;
    const list = all.filter((p) => ids.includes(p.id));
    const content = list.length
      ? new ProductList({
          products: list,
          cart: this.props.cartContext,
          wishlist: this.props.wishlist,
        }).render()
      : '<div class="wishlist-page__empty">Your wishlist is waiting for treasures. Start exploring!</div>';
    return `
      <section class="wishlist-page">
        <header class="wishlist-page__header">
          <h2 class="wishlist-page__title">Wishlist</h2>
          <p class="wishlist-page__count">${list.length} saved item${
      list.length === 1 ? "" : "s"
    }</p>
        </header>
        <div class="wishlist-page__content">
          ${content}
        </div>
      </section>
    `;
  }
}
