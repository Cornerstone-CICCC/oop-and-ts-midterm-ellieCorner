import { Component } from "../common/Component.js";
import { CartItem } from "./CartItem.js";

export class CartList extends Component {
  constructor(props) {
    super(props);
    this.state = { snapshot: props.cartContext.snapshot() };
  }
  beforeMount() {
    this.unsubscribe = this.props.cartContext.subscribe((s) =>
      this.setState({ snapshot: s })
    );
  }
  afterUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }
  render() {
    const { snapshot } = this.state;
    const isEmpty = snapshot.items.length === 0;
    const listHtml = isEmpty
      ? '<li class="cart-panel__empty">Your cart is empty.</li>'
      : snapshot.items
          .map((it) =>
            new CartItem({ item: it, cart: this.props.cartContext }).render()
          )
          .join("");
    return `
      <section class="cart-panel" aria-live="polite">
        <header class="cart-panel__header">
          <div class="cart-panel__heading">
            <h2 class="cart-panel__title">Your Cart</h2>
            <span class="cart-panel__count">${snapshot.totalItems} items</span>
          </div>
          <button
            type="button"
            class="btn btn--icon cart-panel__close"
            data-action="cart-close"
            aria-label="Close cart"
          >
            ×
          </button>
        </header>
        <ul class="cart-panel__list" role="list">
          ${listHtml}
        </ul>
        <footer class="cart-panel__footer">
          <div class="cart-panel__totals">
            <span class="cart-panel__label">Subtotal</span>
            <span class="cart-panel__value">$${snapshot.totalPrice.toFixed(
              2
            )}</span>
          </div>
          <button
            type="button"
            class="btn btn--ghost"
            data-action="cart-clear"
            ${isEmpty ? "disabled" : ""}
          >
            Clear cart
          </button>
        </footer>
      </section>
    `;
  }
}
