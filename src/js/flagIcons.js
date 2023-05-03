import flag0 from 'url:/assets/flags/0.png';
import flag1 from 'url:/assets/flags/1.png';
import flag2 from 'url:/assets/flags/2.png';
import flag3 from 'url:/assets/flags/3.png';
import flag4 from 'url:/assets/flags/4.png';
import flag5 from 'url:/assets/flags/5.png';
import flag6 from 'url:/assets/flags/6.png';
import flag7 from 'url:/assets/flags/7.png';
import flag8 from 'url:/assets/flags/8.png';
import flag9 from 'url:/assets/flags/9.png';
import flag10 from 'url:/assets/flags/10.png';
import flag11 from 'url:/assets/flags/11.png';
import flag12 from 'url:/assets/flags/12.png';
import flag13 from 'url:/assets/flags/13.png';
import flag14 from 'url:/assets/flags/14.png';
import flag15 from 'url:/assets/flags/15.png';
import flag16 from 'url:/assets/flags/16.png';
import flag17 from 'url:/assets/flags/17.png';
import flag18 from 'url:/assets/flags/18.png';
import flag19 from 'url:/assets/flags/19.png';
import flag20 from 'url:/assets/flags/20.png';
import flag21 from 'url:/assets/flags/21.png';
import flag22 from 'url:/assets/flags/22.png';
import flag23 from 'url:/assets/flags/23.png';
import flag24 from 'url:/assets/flags/24.png';
import flag25 from 'url:/assets/flags/25.png';
import flag26 from 'url:/assets/flags/26.png';
import flag27 from 'url:/assets/flags/27.png';
import flag28 from 'url:/assets/flags/28.png';
import flag29 from 'url:/assets/flags/29.png';
import flag30 from 'url:/assets/flags/30.png';
import flag31 from 'url:/assets/flags/31.png';
import flag32 from 'url:/assets/flags/32.png';
import flag33 from 'url:/assets/flags/33.png';
import flag34 from 'url:/assets/flags/34.png';
import { wait } from './helpers';
import { async } from 'regenerator-runtime';

class FlagIcons {
  flags = [
    flag0,
    flag1,
    flag2,
    flag3,
    flag4,
    flag5,
    flag6,
    flag7,
    flag8,
    flag9,
    flag10,
    flag11,
    flag12,
    flag13,
    flag14,
    flag15,
    flag16,
    flag17,
    flag18,
    flag19,
    flag20,
    flag21,
    flag22,
    flag23,
    flag24,
    flag25,
    flag26,
    flag27,
    flag28,
    flag29,
    flag30,
    flag31,
    flag32,
    flag33,
    flag34,
  ];

  generateMarkUp() {
    return this.flags
      .map(
        (flag, index) =>
          `<img class="console__flag flags__${index}" src="${flag}" alt="Flag ${index}">`
      )
      .join('');
  }
  // ANIMATION
  #setFlegsPosition() {
    this.flags.forEach((flag, i) =>
      gsap.set(`.flags__${i}`, {
        x: `${(i % 5) * 8.3 - 22}rem`,
        y: `${(i % 7) * 8.8 - 2}rem`,
        scale: 0,
        opacity: 0,
      })
    );
  }
  async #fadingInFlags() {
    // selecting all flag elements in an array
    const flags = [...document.querySelectorAll('.console__flag')];
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
  }
  async #slidingOut() {
    await gsap.to('.console__flag', {
      x: '100rem',
      duration: 0.3,
      stagger: 0.015,
      opacity: 0,
      ease: 'power2.in',
    });
  }
  async animate() {
    // setting initial position, scale and opacity
    this.#setFlegsPosition();

    // fading in and scaling up one random flag at a time
    this.#fadingInFlags();

    await wait(1.7);

    // sliding out flag icon animation
    await this.#slidingOut();
  }
  async #throwFlag(i) {
    let tl = gsap.timeline();

    tl.fromTo(
      `.flags__${i}`,
      {
        top: '110%',
        left: '40%',
        scale: 0.2,
        opacity: 0,
      },
      {
        x: -300 + Math.random() * 600,
        y: -1000 + Math.random() * 100,
        rotation: Math.random() * 4 * 360,
        // scale: 0.5 + Math.random() * 1,

        scale: 1,
        opacity: 1,
        duration: 2.5,
        ease: 'power3.out',
      }
    );

    tl.to(`.flags__${i}`, {
      duration: 0.5,
    });

    await wait(0.1 * Math.random());
  }
  async fireWork() {
    for (let i = 0; i < 35; i++) {
      await this.#throwFlag(i);
    }
  }
}
export default new FlagIcons();
