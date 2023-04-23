import { View } from './View';

class CountryView extends View {
  constructor() {
    super();
    this.parentElement = document.querySelector('.country');
    this.markUp = this.#generateMarkUp();
    this.render();
  }

  #generateMarkUp() {
    return `
    <h3 class="country__name"></h3>

    <img class="country__img" src=" " />

    <div class="country__data"></div>
    `;
  }
}
export default new CountryView();
