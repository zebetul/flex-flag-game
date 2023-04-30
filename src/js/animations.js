import { async } from 'regenerator-runtime';
import { wait } from './helpers';
import flagIcons from './flagIcons';
import gameTitle from './gameTitle';

// ----------> INIT ANIMATIONS (GSAP)-----------------------
// FLAGS ANIMATION
const _setFlegsPosition = function () {
  flagIcons.flags.map((flag, i) =>
    gsap.set(`.flags__${i}`, {
      x: `${(i % 5) * 8.3 - 22}rem`,
      y: `${(i % 7) * 8.8 - 2}rem`,
      scale: 0,
      opacity: 0,
    })
  );
};
const _fadingInFlags = async function () {
  // selecting all flag elements in an array
  const flags = [...document.querySelectorAll('.flag__intro')];
  const flagsNumber = flags.length;

  // // animating flag icons
  for (let i = 0; i <= flagsNumber; i++) {
    // extracts a random element from the flag elements array and shortens the array to not be able to extract same elem. twice
    const flag = flags.splice(Math.trunc(Math.random() * flags.length), 1);

    gsap.to(flag, {
      scale: 0.6,
      opacity: 0.7,
      duration: 2.5,
      ease: 'back.out(9)',
    });

    await wait(0.05);
  }
};
const _slidingOut = async function () {
  await gsap.to('.flag__intro', {
    x: '100rem',
    duration: 0.3,
    stagger: 0.015,
    opacity: 0,
    ease: 'power2.in',
  });
};
// GAME TITLE SLIDE IN ANIMATION
// set title elements initial position
const _setElementsPosition = function () {
  gameTitle.elementsClasses.forEach(elem => {
    // seting initial position values and colors
    const color = gsap.utils.random(gameTitle.colors);
    gsap.to(`.${elem}`, {
      backgroundColor: color,
      position: 'absolute',
      width: '0.5rem',
      height: '10rem',
      borderRadius: '5px',
      boxShadow: '5px 2px 10px rgba(0, 0, 0, 0.342)',
      // x: `${i * 5}rem`,
    });

    // setting different borderColor depending on backgroundColor
    if (color === 'black' || color === 'blue')
      gsap.to(`.${elem}`, {
        border: '1px solid white',
      });
    else
      gsap.to(`.${elem}`, {
        border: '1px solid #333333',
      });
  });
};
// moves elements to the specified position, height, rotation
const _positionElement = function (elem, x, y, height, rot) {
  gsap.to(`.${elem}`, {
    x: `${x}rem`,
    y: `${y}rem`,
    height: `${height}rem`,
    rotate: `${rot}deg`,
    duration: 1,
  });
};
// arranging elements in final FLAX format
const _arrangeTitleFLEX = function () {
  // F
  _positionElement('f__1', 0, 0, 11, 0);
  _positionElement('f__2', 3, 2.5, 5, 90);
  _positionElement('f__3', 3, -2.5, 5, 90);
  // L
  _positionElement('l__1', 7, 0, 11, 0);
  _positionElement('l__2', 10, 8.5, 5, 90);
  // E
  _positionElement('e__1', 14, 0, 11, 0);
  _positionElement('e__2', 17, -2.5, 5, 90);
  _positionElement('e__3', 17, 2.5, 5, 90);
  _positionElement('e__4', 17, 8.5, 5, 90);
  // X
  _positionElement('x__1', 25, -1.5, 14, 35);
  _positionElement('x__2', 23, -0.5, 6, -35);
  _positionElement('x__3', 27.5, 5, 7, -35);
};
// sliding in title animation
const _slideInTitle = async function () {
  await gsap.to('.console__game-title', {
    x: '35rem',
    duration: 1,
    ease: 'back.out(3)',
  });
};
export const flagAnimation = async function () {
  // setting initial position, scale and opacity
  _setFlegsPosition();

  // fading in and scaling up one random flag at a time
  _fadingInFlags();

  await wait(2);

  // sliding out flag icon animation
  await _slidingOut();

  // await wait(0.7);
};
export const titleAnimation = async function () {
  _setElementsPosition();

  _slideInTitle();

  // await wait(0.2);

  _arrangeTitleFLEX();
};
// MENU ITEMS SLIDE IN ANIMATION
export const menuItemsAnim = async function () {
  // selecting menu items without title element
  const [title, ...items] = [...document.querySelector('.console').children];

  // animating items
  gsap.to(items, {
    x: '35rem',
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.5)',
  });
};
