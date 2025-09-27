const ICON_BASE = "./svg";
const svgCache = new Map();
const pending = new Map();

async function loadSvg(src) {
  if (svgCache.has(src)) return svgCache.get(src);
  if (pending.has(src)) return pending.get(src);
  const p = fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      return res.text();
    })
    .then((text) =>
      text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/on[a-zA-Z]+="[^"]*"/g, "")
    )
    .then((cleaned) => {
      svgCache.set(src, cleaned);
      pending.delete(src);
      return cleaned;
    })
    .catch((e) => {
      pending.delete(src);
      console.warn("[Icon] load fail", src, e);
      return null;
    });
  pending.set(src, p);
  return p;
}

export function Icon(name, { size = 20, title, className = "" } = {}) {
  const src = `${ICON_BASE}/${name}.svg`;
  const id = "ic_" + name + "_" + Math.random().toString(36).slice(2);

  queueMicrotask(async () => {
    const host = document.querySelector(`[data-icon-placeholder="${id}"]`);
    if (!host) return;
    const svg = await loadSvg(src);
    if (!svg) {
      host.textContent = "⚠";
      host.className = "icon-error";
      return;
    }
    host.innerHTML = svg;
    const el = host.querySelector("svg");
    if (el) {
      el.setAttribute("width", String(size));
      el.setAttribute("height", String(size));
      if (title) {
        el.setAttribute("aria-label", title);
        el.removeAttribute("aria-hidden");
      } else {
        el.setAttribute("aria-hidden", "true");
      }
    }
    host.className = "icon";
  });
  const aria = title
    ? `role="img" aria-label="${title}"`
    : 'aria-hidden="true"';
  return (
    `<span class="icon-loading ${className}" data-icon-placeholder="${id}" ${aria} style="display:inline-flex;align-items:center;">` +
    `<span class="sr-only">${title || ""}</span>` +
    `</span>`
  );
}

export function preloadIcons(names = []) {
  names.forEach((n) => loadSvg(`${ICON_BASE}/${n}.svg`));
}
