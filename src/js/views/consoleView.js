import { View } from './View';

class ConsoleView extends View {
  constructor() {
    super();
    this.parentElement = document.querySelector('.console__window');
  }

  addHandlerRender(handler) {
    document.querySelector('.btn__start').addEventListener('click', handler);
  }

  slideOut() {
    gsap.to(this.parentElement, {
      y: '-80rem',
      display: 'none',
      duration: 1,
    });
  }

  slideIn() {
    gsap.to(this.parentElement, {
      y: '0rem',
      display: 'flex',
      ease: 'circ',
      duration: 1,
    });
  }
}
export default new ConsoleView();
