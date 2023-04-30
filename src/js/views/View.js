export class View {
  markUp;
  parentElement;

  render(data = this.markUp) {
    this.#clear();
    this.parentElement.insertAdjacentHTML('afterbegin', data);
  }

  #clear() {
    console.log(this);
    this.parentElement.innerHTML = '';
  }
}
