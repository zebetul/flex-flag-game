class ConsoleView {
  #data;
  #parentElement = document.querySelector('.console__window');

  render(data) {
    this.#clear();
    this.#parentElement.insertAdjacentHTML('afterbegin', data);
  }

  #clear() {
    this.#parentElement.innerHTML = '';
  }

  addHandlerRender(handler) {
    document.querySelector('.btn__start').addEventListener('click', handler);
  }

  slideOut() {
    gsap.to(this.#parentElement, {
      y: '-80rem',
      display: 'none',
      duration: 1,
    });
  }

  slideIn() {
    gsap.to(this.#parentElement, {
      y: '0rem',
      display: 'flex',
      ease: 'circ',
      duration: 1,
    });
  }
}
export default new ConsoleView();
