class GameTitle {
  colors = [
    // '#FFFF00',
    // '#FF0000',
    // '#00FF00',
    // '#00FFFF',
    // '#FF00FF',
    // '#9900FF',
    // '#0033FF',
    'white',
    'white',
    'white',
    'white',
    '#00FFFF',
    '#00FFFF',
    'black',
    'blue',
  ];

  // array containing the individual classes of the title elements
  elementsClasses = [
    'f__1',
    'f__2',
    'f__3',
    'l__1',
    'l__2',
    'e__1',
    'e__2',
    'e__3',
    'e__4',
    'x__1',
    'x__2',
    'x__3',
  ];

  // creating title elements
  #generateMarkUpElements = function () {
    // creating elements
    return this.elementsClasses
      .map(elem => `<div class="title__elements ${elem}"></div>`)
      .join('');
  };

  generateMarkUp() {
    return `
    <div class="game__title">${this.#generateMarkUpElements()}</div>
    `;
  }
}
export default new GameTitle();
