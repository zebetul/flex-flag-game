import { View } from './View';

class CountryView extends View {
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
  renderName(content) {
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
}
export default new CountryView();
