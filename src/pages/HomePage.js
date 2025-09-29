import { Component } from "../common/Component.js";
import { ProductList } from "../components/ProductList.js";

const INITIAL_BATCH = 12;

export class HomePage extends Component {
  async beforeMount() {
    this.state = { loadingMore: false };
    this.pendingQuery = null;
    this.queryPromise = null;
    this.activeQuery = this.props.query?.get?.("q") || "";
    this.unsubscribe = this.props.productService.store.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    this.unsubscribeWishlist = this.props.wishlist?.subscribe(() =>
      this.setState({ refresh: Date.now() })
    );
    await this.loadForQuery(this.activeQuery);
    this.setState({ refresh: Date.now() });
  }
  afterMount() {
    this.setupObserver();
  }
  afterUpdate() {
    this.setupObserver();
    const currentQuery = this.props.query?.get?.("q") || "";
    if (currentQuery !== this.activeQuery || this.pendingQuery !== null) {
      this.handleQueryChange(currentQuery);
    }
  }
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeWishlist) this.unsubscribeWishlist();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.sentinel = null;
  }
  async loadForQuery(query) {
    if (query) {
      await this.props.productService.ensureAll();
    } else if (!this.props.productService.store.products.length) {
      await this.props.productService.ensure({ limit: INITIAL_BATCH });
    }
  }
  handleQueryChange(query) {
    this.pendingQuery = query;
    if (this.queryPromise) return;
    const runner = async () => {
      while (this.pendingQuery !== null) {
        const nextQuery = this.pendingQuery;
        this.pendingQuery = null;
        try {
          await this.loadForQuery(nextQuery);
          this.activeQuery = nextQuery;
          this.setState({ refresh: Date.now() });
        } catch (e) {
          console.error("Failed to update products for query", e);
          this.activeQuery = nextQuery;
        }
      }
    };
    this.queryPromise = runner().finally(() => {
      this.queryPromise = null;
    });
  }
  async loadMore() {
    if (this.state?.loadingMore) return;
    const store = this.props.productService.store;
    if (!store.hasMore) return;
    this.setState({ loadingMore: true });
    try {
      await this.props.productService.fetchMore(INITIAL_BATCH);
    } catch (e) {
      console.error("Failed to fetch more products", e);
    } finally {
      this.setState({ loadingMore: false, refresh: Date.now() });
    }
  }
  setupObserver() {
    if (!this.__container) return;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    const sentinel = this.__container.querySelector("[data-infinite-sentinel]");
    this.sentinel = sentinel;
    const store = this.props.productService.store;
    if (!sentinel || !store.hasMore) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadMore();
          }
        });
      },
      { rootMargin: "200px" }
    );
    this.observer.observe(sentinel);
  }
  render() {
    const store = this.props.productService.store;
    const all = store.products;
    const rawQuery = this.props.query?.get?.("q") || "";
    const q = rawQuery.toLowerCase();
    const filtered = q
      ? all.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        )
      : all;
    const listHtml = new ProductList({
      products: filtered,
      cart: this.props.cartContext,
      wishlist: this.props.wishlist,
    }).render();
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    const safeQuery = rawQuery.replace(/[&<>"']/g, (ch) => escapeMap[ch]);
    const isSearching = Boolean(q);
    const hasProducts = filtered.length > 0;
    const loading = store.loading && !filtered.length;
    const emptyHtml = isSearching
      ? `<div class="home-section__empty">No products found for "${safeQuery}".</div>`
      : `<div class="home-section__empty">No products to display yet.</div>`;
    const loadingHtml = loading
      ? '<div class="home-section__loading" role="status">Loading products…</div>'
      : "";
    const loadMoreIndicator =
      filtered.length &&
      (this.state?.loadingMore || (store.loading && filtered.length))
        ? '<div class="home-section__loading" role="status">Loading more…</div>'
        : "";
    const sentinel =
      filtered.length && store.hasMore
        ? '<div class="home-section__sentinel" data-infinite-sentinel aria-hidden="true"></div>'
        : "";
    const subtitle = isSearching
      ? `Showing results for <span class="home-section__highlight">"${safeQuery}"</span>`
      : "Handpicked items just for you";
    const content = hasProducts
      ? `${listHtml}${loadMoreIndicator}${sentinel}`
      : loadingHtml || emptyHtml;
    return `
      <section class="home-section">
        <header class="home-section__header">
          <h2 class="home-section__title">Today's Featured Products</h2>
          <p class="home-section__subtitle">${subtitle}</p>
        </header>
        <div class="home-section__content">
          ${content}
        </div>
      </section>
    `;
  }
}
