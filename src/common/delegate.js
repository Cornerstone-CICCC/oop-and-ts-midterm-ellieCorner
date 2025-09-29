export function delegateActions({
  root = document,
  type = "click",
  attr = "data-action",
  handlers = {},
  aliases = {},
  context = {},
  stopOnHandled = false,
}) {
  root.addEventListener(type, (event) => {
    const target = event.target.closest(`[${attr}]`);
    if (!target) return;
    const raw = target.getAttribute(attr);
    const name = aliases[raw] || raw;
    const handler = handlers[name];
    if (!handler) return;
    try {
      handler({ event, el: target, action: name, context });
    } catch (err) {
      console.warn("[delegateActions] handler error for", name, err);
    }
    if (stopOnHandled) event.stopPropagation();
  });
}

export function delegateModels({
  root = document,
  attr = "data-model",
  context = {},
  handlers = {},
}) {
  root.addEventListener("input", (event) => {
    const el = event.target.closest(`[${attr}]`);
    if (!el) return;
    const model = el.getAttribute(attr);
    const fn = handlers[model];
    if (!fn) return;
    try {
      fn({ event, el, model, context });
    } catch (err) {
      console.warn("[delegateModels] handler error for", model, err);
    }
  });
}
