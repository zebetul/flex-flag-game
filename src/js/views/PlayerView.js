import { wait, formatTimer } from '../helpers';
import { TIME_WARNING } from '../config';
import { View } from './View';

export default class PlayerView extends View {
  #playerNumber;
  #scoreElement;
  #timerElement;
  #flagsElement;
  #countriesListElement;
  #btnHelp;
  #btnGuess;

  score = 0;

  constructor(playerNumber) {
    super();

    this.#playerNumber = playerNumber;

    this.parentElement = document.querySelector(
      `.section__${this.#playerNumber}`
    );

    this.markUp = this.#generateMarkUp();

    this.render();

    this.#scoreElement = document.querySelector(
      `.score__player${this.#playerNumber}`
    );

    this.#timerElement = document.querySelector(
      `.timer__player${this.#playerNumber}`
    );

    this.#flagsElement = document.querySelector(
      `.flag__player${this.#playerNumber}`
    );

    this.#countriesListElement = document.querySelector(
      `.list__${this.#playerNumber}`
    );

    this.#btnHelp = document.querySelector(`.btn__help__${this.#playerNumber}`);

    this.#btnGuess = document.querySelector(
      `.btn__guess__${this.#playerNumber}`
    );
  }

  #generateMarkUp() {
    return `
    <div class="timer__container">
        <div class="timer timer__player${this.#playerNumber}"></div>
        
        <div class="flag__count flag__player${this.#playerNumber}"></div>
    </div>

    <div class="score">
        <h1 class="score__player">Player ${this.#playerNumber + 1}</h1>

        <h2 class="score__score score__player${this.#playerNumber}">0</h2>
    </div>

    <div class="countries">
        <label class="countries__label">Select a country</label>

        <select
        class="countries__list list__${this.#playerNumber}"
        name="countries"
        id="countries"
        ></select>
    </div>

    <button class="btn btn__guess btn__guess__${
      this.#playerNumber
    }">Guess</button>
    <button class="btn btn__help btn__help__${this.#playerNumber}">Help</button>
    `;
  }

  #timerBlinkAnimation() {
    gsap.fromTo(
      this.#timerElement,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        color: 'red',
        duration: 0.5,
      }
    );
  }

  #clearCountriesList() {
    this.#countriesListElement.textContent = '';
  }

  #renderCountry(data) {
    const markUp = `<option value="${data[0]}">${data[0]}</option>`;

    this.#countriesListElement.insertAdjacentHTML('beforeend', markUp);
  }

  addHandlerGuess(handler) {
    this.#btnGuess.addEventListener('click', handler);
  }

  addHandlerHelp(handler) {
    this.#btnHelp.addEventListener('click', handler);
  }

  async renderScore(score) {
    // outcome positive(true): highlight country in countries list
    gsap.to(this.#countriesListElement, {
      backgroundColor: 'green',
      y: '-2rem',
      scale: 1.5,
      repeat: 1,
      ease: 'power4.out',
      yoyo: true,
      yoyoEase: true,
      duration: 1,
    });

    // score scale up if guess correct
    gsap.to(this.#scoreElement, {
      scale: 1.5,
      repeat: 1,
      yoyo: true,
      yoyoEase: true,
      duration: 1,
      ease: 'power4.out',
    });

    // - add points to score counter animation
    const points = score - this.score;
    for (let i = 1; i <= points; i++) {
      this.score += 1;

      this.#scoreElement.textContent = this.score;
      await wait(1 / points);
    }
  }

  renderTimer(seconds) {
    // formating the time left in m:ss and displaying it
    this.#timerElement.textContent = formatTimer(seconds);

    // if less than 20 seconds left then timer blinks red
    if (seconds < TIME_WARNING) this.#timerBlinkAnimation();
  }

  renderFlags(source) {
    this.clearFlags();

    const markUp = source
      .map(src => `<img class="flag__icon" src="${src}" alt="" />`)
      .join('');

    this.#flagsElement.insertAdjacentHTML('beforeend', markUp);
  }

  renderCountriesList(list) {
    // emptying container
    this.#clearCountriesList();

    // rendering list with country names
    list.forEach(country => {
      // insert in each players list container
      this.#renderCountry(country);
    });
  }

  clearFlags() {
    this.#flagsElement.textContent = '';
  }

  clearTimer() {
    this.#timerElement.textContent = '';
  }

  getCountry() {
    return this.#countriesListElement.value;
  }

  resetTimerColour() {
    gsap.set(this.#timerElement, {
      color: 'rgb(0, 140, 255)',
    });
  }

  renderMissedAnimation() {
    gsap.to(this.#countriesListElement, {
      backgroundColor: 'red',
      // fontSize: '2rem',
      // scale: 1.3,
      repeat: 1,
      ease: 'power4.out',
      yoyo: true,
      // yoyoEase: true,
      duration: 1,
    });
  }

  slide(data) {
    gsap.to(this.parentElement, {
      x: `${data}rem`,
      display: 'flex',
      duration: 1,
      ease: 'circ',
    });
  }

  // adds active player class and displays buttons
  activatePlayer() {
    this.parentElement.classList.add('player--active');
    gsap.set([this.#btnHelp, this.#btnGuess], { display: 'block' });
  }

  // adds active player class and removes buttons
  deactivatePlayer() {
    this.parentElement.classList.remove('player--active');
    gsap.set([this.#btnHelp, this.#btnGuess], { display: 'none' });
  }
}
