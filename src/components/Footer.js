import { Component } from "../common/Component.js";

export class Footer extends Component {
  render() {
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer">
        <div class="site-footer__inner">
          <p class="site-footer__copy">© ${year} FAKE STORE · OOP · Vanilla JS Project</p>
          <p class="site-footer__hint">by Ellie</p>
        </div>
      </footer>
    `;
  }
}
