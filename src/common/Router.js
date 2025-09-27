export class Router {
  constructor(routes) {
    this.routes = routes;
    this.current = { path: "", params: {} };
    window.addEventListener("hashchange", () => this.resolve());
  }
  start() {
    this.resolve();
  }
  parse(hash) {
    const cleaned = hash.replace(/^#/, "") || "/";
    const [pathPart, queryString = ""] = cleaned.split("?");
    const path = pathPart || "/";
    return { path, query: new URLSearchParams(queryString) };
  }
  match(path) {
    for (const r of this.routes) {
      const { pattern, keys } =
        r.__compiled || (r.__compiled = compile(r.path));
      const m = path.match(pattern);
      if (m) {
        const params = {};
        keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { route: r, params };
      }
    }
    return null;
  }
  navigate(path) {
    window.location.hash = path;
  }
  resolve() {
    const { path, query } = this.parse(window.location.hash);
    const found = this.match(path);
    if (found) {
      this.current = {
        path,
        params: found.params,
        query,
        componentFactory: found.route.component,
      };
    } else {
      this.current = {
        path,
        params: {},
        query,
        componentFactory: () => null,
      };
    }
    if (this.onChange) this.onChange(this.current);
  }
}

function compile(path) {
  const keys = [];
  const pattern = path.replace(/\/+/g, "/").replace(/:(\w+)/g, (_, k) => {
    keys.push(k);
    return "([^/]+)";
  });
  return { pattern: new RegExp("^" + pattern + "$"), keys };
}
