import { View } from './View';

export default class CountryView extends View {
  #flagElement;
  #nameElement;
  #factsElement;

  constructor() {
    super();
    this.parentElement = document.querySelector('.country');
    this.markUp = this.#generateMarkUp();
    this.render();

    this.#flagElement = document.querySelector('.country__img');
    this.#nameElement = document.querySelector('.country__name');
    this.#factsElement = document.querySelector('.country__data');
  }
  #generateMarkUp() {
    return `
    <h3 class="country__name"></h3>

    <img class="country__img" src=" " />

    <div class="country__data"></div>
    `;
  }
  renderInfo(content) {
    this.#nameElement.textContent = content;
  }
  renderFlag(source) {
    this.#flagElement.src = source;
  }
  renderFact(fact) {
    const markUp = `<p class="country__row"><span></span>${fact[0]}: ${fact[1]}</p>`;
    this.#factsElement.insertAdjacentHTML('afterbegin', markUp);

    // animate fact
    gsap.from(`.country__row`, {
      y: '-3.5rem',
      duration: 0.5,
    });
  }
  clearFacts() {
    this.#factsElement.textContent = '';
  }
  renderWinner(playerName, score) {
    const markUp = `
    <div class="score winner">
      <h1 class="score__player winner__player">Player ${playerName}</h1>
      <h2 class="winner__medal">🥇</h2>
      <h2 class="score__score winner__score">${score}</h2>
    </div>
    `;
    this.parentElement.insertAdjacentHTML('afterbegin', markUp);

    gsap.fromTo(
      '.winner__player, .winner__medal, .winner__score',
      {
        y: 400,
        scale: 0.1,
      },
      {
        duration: 1,
        stagger: 0.6,
        y: 0,
        scale: 1,
        ease: 'back.out(1.1)',
      }
    );
  }
}
