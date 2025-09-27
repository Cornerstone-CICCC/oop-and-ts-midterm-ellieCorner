import { App } from "./components/App.js";
import { Header } from "./components/Header.js";
import { CartContext } from "./contexts/CartContext.js";
import { delegateActions, delegateModels } from "./common/delegate.js";
import { ToastStack } from "./components/ToastStack.js";

const root = document.querySelector("#app");
const headerRoot = document.querySelector("#header-root");
const toastRoot = document.querySelector("#toast-root");

const cartContext = new CartContext();

const app = new App({ cartContext });
app.mount(root);

const header = new Header({
  router: app.router,
  productService: app.productService,
  wishlist: app.wishlist,
  cartContext,
});
header.mount(headerRoot);

const toastStack = toastRoot ? new ToastStack({ limit: 4 }) : null;
if (toastStack && toastRoot) {
  toastStack.mount(toastRoot);
}

let searchDebounceId = null;

const closeCart = () => document.body.classList.remove("show-cart");

const notify = (message, options = {}) => {
  if (!message || !toastStack) return;
  const payload =
    typeof message === "string" ? { message, ...options } : { ...message };
  toastStack.show(payload);
};

const dismissToast = (id) => {
  if (!id || !toastStack) return;
  toastStack.hide(id);
};

const toastApi = toastStack
  ? {
      show: notify,
      hide: dismissToast,
    }
  : null;

const navigateCategory = (context, { sort, price }) => {
  const route = context.app.router.current;
  if (!route?.params?.category) return;
  const cat = route.params.category;
  const params = new URLSearchParams(route.query ? route.query.toString() : "");
  if (sort !== undefined) {
    if (sort) params.set("sort", sort);
    else params.delete("sort");
  }
  if (price !== undefined) {
    if (price && price !== "all") params.set("price", price);
    else params.delete("price");
  }
  const qs = params.toString();
  context.app.router.navigate(
    `/category/${encodeURIComponent(cat)}${qs ? `?${qs}` : ""}`
  );
};

function navigateToSearch(value, context, { immediate = false } = {}) {
  const trimmed = value.trim();
  const target = trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/";
  const current = context.app.router.current || {};
  const currentQuery = current.query?.get("q") || "";
  const isSameTarget =
    current.path === "/" &&
    ((trimmed && currentQuery === trimmed) || (!trimmed && !currentQuery));
  if (isSameTarget) return;
  const triggerNavigate = () => {
    context.app.router.navigate(target);
  };
  if (immediate) {
    if (searchDebounceId) {
      clearTimeout(searchDebounceId);
      searchDebounceId = null;
    }
    triggerNavigate();
    return;
  }
  if (searchDebounceId) clearTimeout(searchDebounceId);
  searchDebounceId = setTimeout(() => {
    triggerNavigate();
    searchDebounceId = null;
  }, 180);
}

const actionHandlers = {
  "add-cart": ({ el, context }) => {
    const pid = Number(el.getAttribute("data-id"));
    const prod = context.app.productService.store.getById(pid);
    if (prod) {
      context.cartContext.addProduct(prod);
      context.toast?.show({
        message: "Added to cart.",
        type: "success",
      });
    } else {
      context.toast?.show({
        message: "Unable to add to cart.",
        type: "error",
      });
    }
  },
  "toggle-wish": ({ el, context }) => {
    const pid = Number(el.getAttribute("data-id"));
    const wishlist = context.app.wishlist;
    const wasSaved = wishlist.has(pid);
    wishlist.toggle(pid);
    context.toast?.show({
      message: wasSaved ? "Removed from wishlist." : "Added to wishlist.",
      type: wasSaved ? "info" : "success",
    });
  },
  "cart-dec": ({ el, context }) =>
    context.cartContext.updateQuantity(Number(el.getAttribute("data-id")), -1),
  "cart-inc": ({ el, context }) =>
    context.cartContext.updateQuantity(Number(el.getAttribute("data-id")), 1),
  "cart-remove": ({ el, context }) => {
    const id = Number(el.getAttribute("data-id"));
    const snapshot = context.cartContext.snapshot?.();
    const item = snapshot?.items?.find?.((i) => i.id === id);
    context.cartContext.removeProduct(id);
    if (item) {
      context.toast?.show({
        message: "Removed from cart.",
        type: "info",
      });
    }
  },
  "cart-clear": ({ context }) => {
    const hadItems = context.cartContext.totalItems?.() || 0;
    if (!hadItems) {
      context.toast?.show({
        message: "Cart is already empty.",
        type: "info",
      });
      return;
    }
    context.cartContext.clear();
    context.toast?.show({
      message: "Cleared cart.",
      type: "info",
    });
  },
  "goto-wishlist": ({ context }) => context.app.router.navigate("/wishlist"),
  "toggle-cart": () => document.body.classList.toggle("show-cart"),
  "cart-close": closeCart,
  "cart-overlay": closeCart,
  "price-filter": ({ el, context }) => {
    const price = el.getAttribute("data-price") || "all";
    navigateCategory(context, { price });
  },
  "toast-dismiss": ({ el, context }) => {
    const id = el.getAttribute("data-toast-id");
    context.toast?.hide(id);
  },
  sort: ({ el, context }) => {
    const sort = el.getAttribute("data-sort");
    navigateCategory(context, { sort });
  },
  "search-form": ({ event, context }) => {
    event.preventDefault();
    const form = event.target.closest('[data-action="search-form"]');
    const val = form.querySelector('[data-model="search-q"]').value.trim();
    navigateToSearch(val, context, { immediate: true });
  },
};

const actionAliases = {
  "pd-add-cart": "add-cart",
  "pd-toggle-wish": "toggle-wish",
};

delegateActions({
  handlers: actionHandlers,
  aliases: actionAliases,
  context: { app, cartContext, toast: toastApi },
});

delegateModels({
  handlers: {
    "search-q": ({ el, context }) => {
      navigateToSearch(el.value, context);
    },
  },
  context: { app, cartContext, toast: toastApi },
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("show-cart")) {
    closeCart();
  }
});
