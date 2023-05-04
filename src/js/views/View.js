export class View {
  markUp;
  parentElement;

  #clear() {
    this.parentElement.innerHTML = '';
  }
  render(data = this.markUp) {
    this.#clear();
    this.parentElement.insertAdjacentHTML('afterbegin', data);
  }
}
