import { View } from './View';

class ConsoleView extends View {
  constructor() {
    super();
    this.parentElement = document.querySelector('.console');
  }
  addHandlerStart(handler) {
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
  readGameSettings() {
    // getting players number
    const plNrNodeList = document.getElementsByName('drone');
    const numberOfPlayers = +Array.from(plNrNodeList).find(
      element => element.checked
    ).value;

    // getting minutes
    const timeNodeList = document.getElementsByName('time');
    const time = +Array.from(timeNodeList).find(element => element.checked)
      .value;

    // getting flags
    const turnsNodeList = document.getElementsByName('flags');
    const turns = +Array.from(turnsNodeList).find(element => element.checked)
      .value;

    return { numberOfPlayers: numberOfPlayers, time: time * 60, turns: turns };
  }
}
export default new ConsoleView();
