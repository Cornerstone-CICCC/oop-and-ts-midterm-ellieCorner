import { Component } from "../common/Component.js";

const DEFAULT_DURATION = 3200;
const DEFAULT_LIMIT = 4;
const ESCAPE_LOOKUP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ESCAPE_LOOKUP[char] || char);

export class ToastStack extends Component {
  constructor(props = {}) {
    super(props);
    this.state = {
      toasts: [],
    };
    this.queue = [];
    this.timers = new Map();
    this.limit = props.limit || DEFAULT_LIMIT;
  }

  show({ message, type = "default", duration = DEFAULT_DURATION } = {}) {
    if (!message) return;
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = { id, message, type, duration };
    this.queue.push(toast);
    this.flush();
  }

  flush() {
    const active = this.state?.toasts || [];
    if (active.length >= this.limit) return;
    if (!this.queue.length) return;
    const toast = this.queue.shift();
    this.setState((state) => {
      const list = state.toasts ? [...state.toasts] : [];
      const next = [...list, toast].slice(-this.limit);
      return { toasts: next };
    });
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        this.hide(toast.id);
      }, toast.duration);
      this.timers.set(toast.id, timer);
    }
    if (this.queue.length) {
      queueMicrotask(() => this.flush());
    }
  }

  hide(id) {
    if (!id) return;
    this.clearTimer(id);
    this.setState((state) => {
      const list = state.toasts ? state.toasts.filter((t) => t.id !== id) : [];
      return { toasts: list };
    });
    if (this.queue.length) {
      queueMicrotask(() => this.flush());
    }
  }

  clearTimer(id) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  beforeUnmount() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.queue = [];
  }

  render() {
    const toasts = this.state?.toasts || [];
    if (!toasts.length) {
      return '<div class="toast-stack" aria-live="polite" aria-atomic="true"></div>';
    }
    const items = toasts
      .map((toast) => {
        const typeClass = toast.type ? ` toast--${toast.type}` : "";
        const message = escapeHtml(toast.message);
        return `<div class="toast${typeClass}" data-toast-id="${toast.id}">
          <div class="toast__body">${message}</div>
          <button type="button" class="toast__close" data-action="toast-dismiss" aria-label="Dismiss notification" data-toast-id="${toast.id}">×</button>
        </div>`;
      })
      .join("");
    return `<div class="toast-stack" aria-live="polite" aria-atomic="true">${items}</div>`;
  }
}
