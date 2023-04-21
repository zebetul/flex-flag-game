export default class PlayerView {
  #playerNumber;
  #parentElement;
  #markUp;

  constructor(playerNumber) {
    this.#playerNumber = playerNumber;
    this.#parentElement = document.querySelector(
      `.section__${this.#playerNumber}`
    );
  }

  render(score) {
    this.#clear();

    this.#markUp = this.#generateMarkUp(score);

    this.#parentElement.insertAdjacentHTML('afterbegin', this.#markUp);
  }

  #generateMarkUp(score) {
    return `
    <div class="timer__container">
        <div class="timer"></div>
        
        <div class="flag__count"></div>
    </div>

    <div class="score">
        <h1 class="score__player">Player ${this.#playerNumber + 1}</h1>

        <h2 class="score__score">${score}</h2>
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
}
