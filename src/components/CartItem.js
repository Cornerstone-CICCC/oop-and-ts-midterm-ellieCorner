import { Component } from "../common/Component.js";

export class CartItem extends Component {
  render() {
    const { item } = this.props;
    const linePrice = (item.price * item.quantity).toFixed(2);
    return `
      <li class="cart-panel__item cart-item" data-id="${item.id}">
        <div class="cart-item__media">
          <img src="${item.image}" alt="${
      item.title
    }" loading="lazy" width="60" height="60" />
        </div>
        <div class="cart-item__info">
          <p class="cart-item__title">${item.title}</p>
          <span class="cart-item__price">$${item.price.toFixed(2)}</span>
        </div>
        <div class="cart-item__actions">
          <div class="cart-item__quantity" aria-label="Quantity controls">
            <button
              type="button"
              class="cart-item__qty-btn"
              data-action="cart-dec"
              data-id="${item.id}"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span class="cart-item__qty-value" aria-live="polite">${
              item.quantity
            }</span>
            <button
              type="button"
              class="cart-item__qty-btn"
              data-action="cart-inc"
              data-id="${item.id}"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span class="cart-item__total">$${linePrice}</span>
          <button
            type="button"
            class="cart-item__remove btn btn--text"
            data-action="cart-remove"
            data-id="${item.id}"
          >
            Remove
          </button>
        </div>
      </li>
    `;
  }
}
