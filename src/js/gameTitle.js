import { wait } from './helpers';

class GameTitle {
  // cssClass, positionX, positionY, height, rotation
  #elements = [
    // F
    ['f__1', 0, 0, 11, 0, '#FFFF00'],
    ['f__2', 3, 2.5, 5, 90, '#FF0000'],
    ['f__3', 3, -2.5, 5, 90, '#00FF00'],
    // L
    ['l__1', 7, 0, 11, 0, '#00FFFF'],
    ['l__2', 10, 8.5, 5, 90, '#FF00FF'],
    // E
    ['e__1', 14, 0, 11, 0, '#00FF00'],
    ['e__2', 17, -2.5, 5, 90, '#FFFF00'],
    ['e__3', 17, 2.5, 5, 90, 'white'],
    ['e__4', 17, 8.5, 5, 90, '#FF0000'],
    // X
    ['x__1', 25, -1.5, 14, 35, '#00FFFF'],
    ['x__2', 23, -0.5, 6, -35, 'blue'],
    ['x__3', 27.5, 5, 7, -35, '#FF0000'],
  ];

  #generateElementsMarkUp() {
    return this.#elements
      .map(elem => `<div class="title__elements ${elem[0]}"></div>`)
      .join('');
  }
  generateMarkUp() {
    return `
    <div class="console__game-title">${this.#generateElementsMarkUp()}</div>
    `;
  }
  // ANIMATION
  #setElement(cssClass, positionX, positionY, height, rotation, color) {
    gsap.to(`.${cssClass}`, {
      backgroundColor: color,
      position: 'absolute',
      width: '0.7rem',
      height: '10rem',
      borderRadius: '5px',
      boxShadow: '5px 2px 10px rgba(0, 0, 0, 0.342)',
      x: `${positionX}rem`,
      y: `${positionY}rem`,
      height: `${height}rem`,
      rotate: `${rotation}deg`,
      duration: 1.7,
    });

    // setting different borderColor depending on backgroundColor
    if (color === '#FF00FF' || color === 'blue')
      gsap.to(`.${cssClass}`, {
        border: '1px solid white',
      });
    else
      gsap.to(`.${cssClass}`, {
        border: '1px solid #333333',
      });
  }
  async #slideIn() {
    await gsap.to('.console__game-title', {
      x: '35rem',
      duration: 1.2,
      ease: 'back.out(3)',
    });
  }
  async animate() {
    // arrange title elements in FLEX
    this.#elements.forEach(properties => this.#setElement(...properties));
    await wait(0.4);
    this.#slideIn();
  }
}
export default new GameTitle();
