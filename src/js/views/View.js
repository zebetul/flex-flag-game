export class View {
  markUp;
  parentElement;

  render(data = this.markUp) {
    this.#clear();
    this.parentElement.insertAdjacentHTML('afterbegin', data);
  }

  #clear() {
    this.parentElement.innerHTML = '';
  }
}
