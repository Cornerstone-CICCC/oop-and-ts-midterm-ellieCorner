import { Component } from "../common/Component.js";
import { ProductList } from "../components/ProductList.js";

const PRICE_FILTERS = [
  { key: "all", label: "All prices", range: null },
  { key: "0-50", label: "$0 – $50", range: [0, 50] },
  { key: "50-100", label: "$50 – $100", range: [50, 100] },
  { key: "100-150", label: "$100 – $150", range: [100, 150] },
  { key: "150+", label: "$150+", range: [150, Number.POSITIVE_INFINITY] },
];

export class CategoryPage extends Component {
  async beforeMount() {
    this.state = {
      sort: this.props.query?.get?.("sort") || null,
      priceKey: this.props.query?.get?.("price") || "all",
    };
    this.unsubscribe = this.props.productService.store.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    this.unsubscribeWishlist = this.props.wishlist?.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    await this.props.productService.ensureAll();
    this.setState({ refresh: Date.now() });
  }
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeWishlist) this.unsubscribeWishlist();
  }
  render() {
    const { category } = this.props.params;
    const sort = this.state?.sort;
    const priceKey = this.state?.priceKey || "all";
    const priceConfig =
      PRICE_FILTERS.find((filter) => filter.key === priceKey) ||
      PRICE_FILTERS[0];
    const priceRange = priceConfig?.range || null;
    const list = this.props.productService.store.filter({
      category,
      sort,
      priceRange,
    });
    const productsHtml = list.length
      ? new ProductList({
          products: list,
          cart: this.props.cartContext,
          wishlist: this.props.wishlist,
        }).render()
      : `<div class="category-page__empty" role="status" aria-live="polite">
          No products match your filters.
        </div>`;
    const activeSort = sort;
    const activePrice = priceConfig?.key || "all";
    const priceFiltersHtml = PRICE_FILTERS.map((filter) => {
      const isActive = filter.key === activePrice;
      return `
        <button
          type="button"
          class="btn btn--ghost ${isActive ? "btn--active" : ""}"
          data-action="price-filter"
          data-price="${filter.key}"
        >
          ${filter.label}
        </button>
      `;
    }).join("");
    return `
      <section class="category-page">
        <header class="category-page__header">
          <h2 class="category-page__title">${category}</h2>
          <p class="category-page__subtitle">
            ${list.length} product${list.length === 1 ? "" : "s"} available
          </p>
        </header>
        <div class="category-page__layout">
          <aside class="category-page__filters" aria-label="Sort products">
            <h3 class="category-page__filters-title">Sort by price</h3>
            <div class="category-page__filters-group">
              <button
                type="button"
                class="btn btn--ghost ${
                  activeSort === "price-asc" ? "btn--active" : ""
                }"
                data-action="sort"
                data-sort="price-asc"
              >
                Low to High
              </button>
              <button
                type="button"
                class="btn btn--ghost ${
                  activeSort === "price-desc" ? "btn--active" : ""
                }"
                data-action="sort"
                data-sort="price-desc"
              >
                High to Low
              </button>
              <button
                type="button"
                class="btn btn--ghost ${
                  activeSort === "title" ? "btn--active" : ""
                }"
                data-action="sort"
                data-sort="title"
              >
                Title A → Z
              </button>
            </div>
            <h3 class="category-page__filters-title">Filter by price</h3>
            <div class="category-page__filters-group">
              ${priceFiltersHtml}
            </div>
          </aside>
          <div class="category-page__list">${productsHtml}</div>
        </div>
      </section>
    `;
  }
}
