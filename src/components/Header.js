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
      searchQuery: this.deriveSearchQuery(props.router),
    };
    this._restoreSearchFocus = false;
    this._searchSelection = null;
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
  deriveSearchQuery(router) {
    if (!router?.current) return "";
    return router.current.query?.get("q") ?? "";
  }
  updateRouteState() {
    const activeKey = this.deriveActiveKey(this.props.router);
    const searchQuery = this.deriveSearchQuery(this.props.router);
    const updates = {};
    if (activeKey !== this.state.activeKey) updates.activeKey = activeKey;
    if (searchQuery !== this.state.searchQuery)
      updates.searchQuery = searchQuery;
    if (Object.keys(updates).length) {
      this.setState(updates);
    }
  }
  beforeUpdate() {
    super.beforeUpdate();
    const activeEl = document.activeElement;
    if (
      activeEl &&
      activeEl.matches?.('input[type="search"][data-model="search-q"]')
    ) {
      this._restoreSearchFocus = true;
      try {
        this._searchSelection = {
          start: activeEl.selectionStart,
          end: activeEl.selectionEnd,
        };
      } catch (err) {
        this._searchSelection = null;
      }
    } else {
      this._restoreSearchFocus = false;
      this._searchSelection = null;
    }
  }
  render() {
    const {
      wishlistCount = 0,
      cartCount = 0,
      categories = [],
      activeKey = "home",
      searchQuery = "",
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
                <input type="search" placeholder="Search" aria-label="Product search" data-model="search-q" value="${escapeHtml(
                  searchQuery
                )}" />
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
  afterRender() {
    super.afterRender();
    if (this._restoreSearchFocus) {
      const input = this.__container?.querySelector?.(
        'input[type="search"][data-model="search-q"]'
      );
      if (input) {
        try {
          input.focus({ preventScroll: true });
        } catch (err) {
          input.focus();
        }
        if (
          this._searchSelection &&
          typeof this._searchSelection.start === "number" &&
          typeof this._searchSelection.end === "number"
        ) {
          try {
            input.setSelectionRange(
              this._searchSelection.start,
              this._searchSelection.end
            );
          } catch (err) {
            /* ignore */
          }
        }
      }
    }
    this._restoreSearchFocus = false;
    this._searchSelection = null;
  }
}
