import { wait } from '../helpers';

export default class PlayerView {
  #playerNumber;
  #parentElement;
  #markUp;
  #scoreElement;
  #timerElement;
  #countriesList;

  score = 0;

  constructor(playerNumber) {
    this.#playerNumber = playerNumber;

    this.#parentElement = document.querySelector(
      `.section__${this.#playerNumber}`
    );

    this.render();

    this.#scoreElement = document.querySelector(
      `.score__player${this.#playerNumber}`
    );

    this.#timerElement = document.querySelector(
      `.timer__player${this.#playerNumber}`
    );

    this.#countriesList = document.querySelector(
      `.list__${this.#playerNumber}`
    );
  }

  render() {
    this.#clear();
    this.#markUp = this.#generateMarkUp();
    this.#parentElement.insertAdjacentHTML('afterbegin', this.#markUp);
  }

  #generateMarkUp() {
    return `
    <div class="timer__container">
        <div class="timer timer__player${this.#playerNumber}"></div>
        
        <div class="flag__count"></div>
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

    <button class="btn btn__guess btn__${this.#playerNumber}">Guess</button>
    <button class="btn btn__help btn__${this.#playerNumber}">Help</button>
    `;
  }

  #clear() {
    this.#parentElement.innerHTML = '';
  }

  async renderScore(score) {
    // outcome positive(true): highlight country in countries list
    gsap.to(this.#countriesList, {
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

  // renderScore(score) {
  //   this.#scoreElement.textContent = score;
  // }

  renderTimer(timeLeft) {
    this.#scoreElement.textContent = timeLeft;
  }
}
