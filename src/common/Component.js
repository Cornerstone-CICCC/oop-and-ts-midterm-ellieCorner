export class Component {
  constructor(props = {}) {
    this.props = props
    this.element = null
  }

  render() {
    throw new Error('Component should have a render() method!')
  }

  mount(container) {
    this.element = this.render()
    container.appendChild(this.element)
  }
}