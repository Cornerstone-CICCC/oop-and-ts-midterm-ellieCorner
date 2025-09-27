import { Component } from "../common/Component.js";
import { Footer } from "./Footer.js";
import { CartList } from "./CartList.js";
import { Router } from "../common/Router.js";
import { ProductStore } from "../contexts/ProductStore.js";
import { ProductService } from "../services/ProductService.js";
import { WishlistContext } from "../contexts/WishlistContext.js";
import { HomePage } from "../pages/HomePage.js";
import { CategoryPage } from "../pages/CategoryPage.js";
import { ProductDetailPage } from "../pages/ProductDetailPage.js";
import { WishlistPage } from "../pages/WishlistPage.js";

export class App extends Component {
  constructor(props) {
    super(props);
    this.productStore = new ProductStore();
    this.productService = new ProductService(this.productStore);
    this.wishlist = new WishlistContext();
    this.footer = new Footer({});
    this.cartList = new CartList({
      cartContext: this.props.cartContext,
    });
    this.pageInstance = null;
    this.__bootstrapped = false;
    this.router = new Router([
      {
        path: "/",
        component: ({ query }) =>
          new HomePage({
            productService: this.productService,
            cartContext: this.props.cartContext,
            wishlist: this.wishlist,
            router: this.router,
            query,
          }),
      },
      {
        path: "/category/:category",
        component: ({ params, query }) =>
          new CategoryPage({
            productService: this.productService,
            cartContext: this.props.cartContext,
            wishlist: this.wishlist,
            params,
            query,
            router: this.router,
          }),
      },
      {
        path: "/product/:id",
        component: ({ params }) =>
          new ProductDetailPage({
            productService: this.productService,
            cartContext: this.props.cartContext,
            wishlist: this.wishlist,
            params,
            router: this.router,
          }),
      },
      {
        path: "/wishlist",
        component: () =>
          new WishlistPage({
            productService: this.productService,
            cartContext: this.props.cartContext,
            wishlist: this.wishlist,
            router: this.router,
          }),
      },
    ]);
    this.router.onChange = () => this.setState({ routeVersion: Date.now() });
    this.router.start();
  }
  render() {
    return `
      <div class="app-shell">
        <main class="app-shell__main" role="main">
          <div data-page-root></div>
        </main>
        <button
          type="button"
          class="app-shell__overlay"
          data-action="cart-overlay"
          aria-label="Close cart drawer"
        ></button>
        <aside class="app-shell__cart cart-drawer" aria-label="Shopping cart">
          <div data-cart-root></div>
        </aside>
        <div class="app-shell__footer">
          <div data-footer-root></div>
        </div>
      </div>
    `;
  }
  afterRender() {
    if (!this.__container) return;
    if (!this.__bootstrapped) {
      this.pageRoot = this.__container.querySelector("[data-page-root]");
      this.cartRoot = this.__container.querySelector("[data-cart-root]");
      this.footerRoot = this.__container.querySelector("[data-footer-root]");
      if (this.cartRoot) {
        this.cartList.mount(this.cartRoot);
      }
      if (this.footerRoot) {
        this.footer.mount(this.footerRoot);
      }
      this.__bootstrapped = true;
    }
    this.renderPage();
  }
  update() {
    if (!this.__container) return;
    this.beforeUpdate();
    if (!this.__bootstrapped) {
      this.__container.innerHTML = this.render();
    }
    this.afterRender();
    this.afterUpdate();
  }
  renderPage() {
    if (!this.pageRoot) return;
    if (this.pageInstance && typeof this.pageInstance.unmount === "function") {
      this.pageInstance.unmount();
      this.pageInstance = null;
    }
    const route = this.router.current;
    if (!route || !route.componentFactory) {
      this.pageRoot.innerHTML = "<div>Not Found</div>";
      return;
    }
    const instance = route.componentFactory({
      params: route.params,
      query: route.query,
    });
    if (instance && typeof instance.mount === "function") {
      instance.mount(this.pageRoot);
      this.pageInstance = instance;
    } else if (instance && typeof instance.render === "function") {
      this.pageRoot.innerHTML = instance.render();
    } else if (typeof instance === "string") {
      this.pageRoot.innerHTML = instance;
    } else {
      this.pageRoot.innerHTML = "<div>Not Found</div>";
    }
  }
}
