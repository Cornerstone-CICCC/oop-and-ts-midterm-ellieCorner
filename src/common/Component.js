export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.__container = null;
    this.__pendingState = null;
    this.__scheduled = false;
  }

  setState(partial) {
    const patch = typeof partial === "function" ? partial(this.state) : partial;
    this.__pendingState = { ...(this.__pendingState || {}), ...patch };
    if (!this.__scheduled) {
      this.__scheduled = true;
      queueMicrotask(() => {
        this.__scheduled = false;
        if (this.__pendingState) {
          this.state = { ...this.state, ...this.__pendingState };
          this.__pendingState = null;
          this.update();
        }
      });
    }
  }

  render() {
    throw new Error("Component.render() must return HTML string");
  }

  beforeMount() {}
  afterMount() {}
  beforeUpdate() {}
  afterUpdate() {}
  beforeUnmount() {}
  afterUnmount() {}
  afterRender() {}

  mount(container) {
    this.beforeMount();
    this.__container = container;
    container.innerHTML = this.render();
    this.afterRender();
    this.afterMount();
  }

  update() {
    if (!this.__container) return;
    this.beforeUpdate();
    this.__container.innerHTML = this.render();
    this.afterRender();
    this.afterUpdate();
  }

  unmount() {
    this.beforeUnmount();
    if (this.__container) this.__container.innerHTML = "";
    this.afterUnmount();
    this.__container = null;
  }
}
