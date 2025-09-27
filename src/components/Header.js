import { Component } from "../common/Component.js";
import { Icon } from "./Icon.js";

export class Header extends Component {
  constructor(props) {
    super(props);
    this.handleHashChange = this.handleHashChange.bind(this);
    this.state = {
      wishlistCount: props.wishlist?.ids?.size || 0,
      cartCount: props.cartContext?.totalItems?.() || 0,
      categories: props.productService?.categories?.() || [],
      activeKey: this.deriveActiveKey(props.router),
    };
  }
  beforeMount() {
    const { wishlist, cartContext, productService } = this.props;
    if (wishlist?.subscribe) {
      this.unsubWishlist = wishlist.subscribe((snapshot) => {
        const count = snapshot?.count ?? snapshot?.ids?.size ?? 0;
        this.setState({ wishlistCount: count });
      });
    }
    if (cartContext?.subscribe) {
      this.unsubCart = cartContext.subscribe((snapshot) => {
        this.setState({ cartCount: snapshot.totalItems });
      });
    }
    if (productService?.store?.subscribe) {
      this.unsubStore = productService.store.subscribe((snapshot) => {
        this.setState({ categories: snapshot.categories || [] });
      });
    }
    this.ensureCategories();
    this.updateRouteState();
  }
  afterMount() {
    window.addEventListener("hashchange", this.handleHashChange);
  }
  afterUnmount() {
    if (this.unsubWishlist) this.unsubWishlist();
    if (this.unsubCart) this.unsubCart();
    if (this.unsubStore) this.unsubStore();
    window.removeEventListener("hashchange", this.handleHashChange);
  }
  async ensureCategories() {
    const { productService } = this.props;
    if (!productService?.fetchCategories) return;
    try {
      const categories = await productService.fetchCategories();
      this.setState({ categories: categories || [] });
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }
  handleHashChange() {
    this.updateRouteState();
  }
  deriveActiveKey(router) {
    if (!router?.current) return "home";
    const { path, params } = router.current;
    if (path?.startsWith("/category/")) {
      return `category:${params?.category ?? ""}`;
    }
    if (path === "/") return "home";
    return "none";
  }
  updateRouteState() {
    const activeKey = this.deriveActiveKey(this.props.router);
    this.setState({ activeKey });
  }
  render() {
    const {
      wishlistCount = 0,
      cartCount = 0,
      categories = [],
      activeKey = "home",
    } = this.state || {};
    const icon = (name, title) => Icon(name, { size: 20, title });
    const escapeHtml = (value = "") =>
      String(value).replace(
        /[&<>"']/g,
        (ch) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[ch])
      );
    const categoryItems = categories.length
      ? categories
          .map((category) => {
            const key = `category:${category}`;
            const isActive = activeKey === key;
            const href = `#/category/${encodeURIComponent(category)}`;
            const ariaCurrent = isActive ? ' aria-current="page"' : "";
            return `<li class="site-header__menu-item ${
              isActive ? "is-active" : ""
            }">
              <a href="${href}" class="site-header__menu-link"${ariaCurrent}>
                ${escapeHtml(category).toUpperCase()}
              </a>
            </li>`;
          })
          .join("")
      : `<li class="site-header__menu-item site-header__menu-item--placeholder">Loading categories…</li>`;
    const allActive = activeKey === "home";
    const allAria = allActive ? ' aria-current="page"' : "";
    return `
      <header class="site-header site-header--layout">
        <div class="site-header__inner">
          <div class="site-header__primary">
            <form class="header-search" role="search" data-action="search-form">
              <div class="header-search__field">
                ${icon("search", "Search")}
                <input type="search" placeholder="Search" aria-label="Product search" data-model="search-q" />
              </div>
            </form>
            <div class="header-logo"><a href="#/" aria-label="Go to home">FAKE STORE</a></div>
            <div class="header-icons">
              <button type="button" class="icon-btn" data-action="goto-wishlist" aria-label="Go to wishlist">
                ${icon("heart", "Wishlist")}
                ${
                  wishlistCount
                    ? `<span class="badge">${wishlistCount}</span>`
                    : ""
                }
              </button>
              <button type="button" class="icon-btn" data-action="toggle-cart" aria-label="Open cart">
                ${icon("cart", "Cart")}
                ${cartCount ? `<span class="badge">${cartCount}</span>` : ""}
              </button>
              <button type="button" class="icon-btn" aria-label="Login (not implemented)">
                ${icon("user", "User")}
              </button>
            </div>
          </div>
          <nav class="site-header__nav" aria-label="Browse categories">
            <ul class="site-header__menu">
              <li class="site-header__menu-item ${
                allActive ? "is-active" : ""
              }">
                <a href="#/" class="site-header__menu-link"${allAria}>All</a>
              </li>
              ${categoryItems}
            </ul>
          </nav>
        </div>
      </header>
    `;
  }
  toggleCart() {
    document.body.classList.toggle("show-cart");
  }
}
