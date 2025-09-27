import { Component } from "../common/Component.js";
import { Icon } from "./Icon.js";

export class ProductItem extends Component {
  render() {
    const { product, wishlist } = this.props;
    if (!product)
      return '<li class="product-grid__item product-grid__item--empty">No product</li>';
    const wished = wishlist && wishlist.has && wishlist.has(product.id);
    const summary =
      typeof product.shortDescription === "function"
        ? product.shortDescription(110)
        : (product.description || "").length > 110
        ? `${product.description.slice(0, 110)}…`
        : product.description || "";
    const icon = (name, title) => Icon(name, { size: 20, title });
    return `
      <li class="product-grid__item" data-product-id="${product.id}">
        <article class="product-card">
          <a href="#/product/${product.id}" class="product-card__link">
            <div class="product-card__media">
              <img
                src="${product.image}"
                alt="${product.title}"
                loading="lazy"
                width="200"
                height="200"
              />
            </div>
            <div class="product-card__body">
              <h3 class="product-card__title">${product.title}</h3>
              <p class="product-card__price">$${product.price.toFixed(2)}</p>
              <p class="product-card__description">${summary}</p>
            </div>
          </a>
          <div class="product-card__actions">
            <button
              type="button"
              class="btn btn--primary product-card__action"
              data-action="add-cart"
              data-id="${product.id}"
            >
              Add to Cart
            </button>
            ${
              wishlist
                ? `<button
                    type="button"
                    class="btn btn--ghost btn--icon product-card__action ${
                      wished ? "btn--active" : ""
                    }"
                    data-action="toggle-wish"
                    data-id="${product.id}"
                    aria-pressed="${wished}"
                    aria-label="${
                      wished ? "Remove from wishlist" : "Add to wishlist"
                    }"
                  >
                    ${icon(wished ? "heart-fill" : "heart", "Heart")}
                  </button>`
                : ""
            }
          </div>
        </article>
      </li>
    `;
  }
}
