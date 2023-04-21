import 'core-js/stable';
import 'regenerator-runtime';
import consoleView from './views/consoleView';
import flagIcons from './flagIcons';
import { wait } from './helpers';
import * as animations from './animations';
import gameTitle from './gameTitle';
import menuItems from './menuItems';
import { menuItemsAnim } from './animations';
import Player from './Player';
import PlayerView from './views/PlayerView';

import flagFilled from 'url:/assets/icons/flag-filled.png';
import flagRed from 'url:/assets/icons/flag-red.png';
import flagEmpty from 'url:/assets/icons/flag-empty.png';

gsap.registerPlugin(MotionPathPlugin);

const main = document.querySelector('main');
const sections = document.querySelectorAll('.section');
const playerName = document.querySelectorAll('.score__player');
const scoreContainer = document.querySelectorAll('.score__score');
const countriesListContainer = document.querySelectorAll('.countries__list');
const turnsContainer = document.querySelectorAll('.turns');
const turnsLabel = document.querySelectorAll('.turns__label');

const buttonsContainer = document.querySelectorAll('.buttons');

const btnsHelp = document.querySelectorAll('.btn__help');
const btnsGuess = document.querySelectorAll('.btn__guess');

const countryContainer = document.querySelector('.country');
const flagContainer = document.querySelector('.country__img');
const countryName = document.querySelector('.country__name');
const countryDataContainer = document.querySelector('.country__data');

const consoleWindow = document.querySelector('.console__window');
const btnStart = document.querySelector('.btn__start');

// single player boolean variable
let singlePlayer;

// array with a list of countries to display
let countryNames;

// country to guess
let country;

// info about the country to display
let countryInfo;

// points to win
let points = 21;

// setting 0 or 1 as player indexes(player1 = 0, player2 = 1) and switching between them as active player
let activePlayer = 0;

let intervalID;

let turns;

// array containing two arrays, one for each player, wich contains a boolean value for each turns played that represents the outcome
// true = country guessed; false = not guessed
const guessValues = [[], []];

// score [player1, player2]
const score = [];

// turns left [player1, player2]
const turnsLeft = [];

// timers [player1, player2] 180 seconds for each
const timers = [];

const renderError = function (err) {
  flagContainer.insertAdjacentText('afterbegin', err);
};

// assingns singlePlayer's value boolean value depending wich option was checked
const numberOfPlayers = function () {
  // setting sinlePlayer boolen value
  if (document.querySelector('.player__1').checked) singlePlayer = true;
  if (document.querySelector('.player__2').checked) singlePlayer = false;
};

// adding active player class and displaying buttons
const activatePlayer = function (player) {
  sections[player].classList.add('player--active');
  gsap.set(`.btn__${player}`, { display: 'block' });
};

const deactivatePlayer = function (player) {
  // deactivating current player
  sections[player].classList.remove('player--active');
  gsap.set(`.btn__${player}`, { display: 'none' });
};

// New game initial conditions (score, turns left, timers, guessValues)
const initData = function () {
  const timersContainer = document.querySelectorAll('.timer');

  // setting player1 as active
  activePlayer = 0;
  activatePlayer(activePlayer);

  // start timer for active player
  intervalID = setInterval(timer, 1000, activePlayer);

  // setting score for each player
  score[0] = score[1] = 0;
  scoreContainer.forEach((cont, i) => (cont.textContent = score[i]));

  // setting turns left for each player
  turnsLeft[0] =
    turnsLeft[1] =
    turns =
      document.querySelector('input[name="flags"]:checked').value;

  // displaying turns left for each player
  renderFlagIcons(0);
  renderFlagIcons(1);

  //   setting timers for each player
  timers[0] = timers[1] =
    document.querySelector('input[name="time"]:checked').value * 60;

  // setting timer containers color blue
  gsap.set(timersContainer, {
    color: 'rgb(0, 140, 255)',
  });

  // reseting guessValues
  guessValues[0].length = guessValues[1].length = 0;
};

// formats and displays timer in m:ss
const renderTimer = function () {
  // formating remaining minutes and seconds to display
  const minutes = Math.trunc(timers[activePlayer] / 60);
  const seconds = (timers[activePlayer] % 60).toString().padStart(2, '0');

  // display updated timer
  const timersContainer = document.querySelectorAll('.timer');
  timersContainer[activePlayer].textContent = `${minutes}:${seconds}`;

  // 20 seconds left timer animation
  if (timers[activePlayer] < 20) {
    const timerBlinkAnim = gsap.fromTo(
      timersContainer[activePlayer],
      {
        opacity: 0,
      },
      {
        opacity: 1,
        color: 'red',
        duration: 0.5,
      }
    );
  }
};

// updates active player's timer decreasing it every second
const timer = function () {
  // decrease timer for active player
  timers[activePlayer] -= 1;

  // display timer
  renderTimer();

  // ----------> TIME IS UP END GAME SCENARIOS
  // if there are two players and active player's timer falls bellow 0 than change player
  if (!singlePlayer && timers[activePlayer] === 0) {
    // delete timer
    clearInterval(intervalID);

    // setting single player true for the rest of the game
    singlePlayer = true;

    deactivatePlayer(activePlayer);

    switchPlayer();
  }

  // if single player and timer is up end game
  if (singlePlayer && timers[activePlayer] === 0) {
    clearInterval(intervalID);
    endGame();
    return;
  }

  // if both timers are up than end game
  if (!singlePlayer && timers[0] === 0 && timers[1] === 0) {
    endGame();
    return;
  }
};

// 1. PUT A LIST WITH ALL COUNTRIES IN EACH PLAYER'S FIELD
const renderCountriesList = async function () {
  try {
    // getting countries list from Rest Countries API
    const res = await fetch('https://restcountries.com/v3.1/all'); // try: https://restcountries.com/v3.1/all?fields=name

    // transforming to JSON
    const countriesList = await res.json();

    if (!res.ok) throw new Error(countriesList);

    // extracting array with country names and cca2 [countryName, cca2]
    countryNames = countriesList.map(country => [
      country.name.common,
      country.cca2,
    ]);

    // sorting country list
    countryNames.sort();

    // emptying container
    countriesListContainer.forEach(container => container.replaceChildren());

    // rendering list with country names
    countryNames.forEach(country => {
      // create option element
      const html = `<option value="${country[0]}">${country[0]}</option>`;

      // insert in each players list container
      countriesListContainer.forEach(container =>
        container.insertAdjacentHTML('beforeend', html)
      );
    });
  } catch (err) {
    renderError(err);
    console.error(`💣💣💣 Something went wrong:${err}`);
  }
};

// 2. DISPLAYS A RANDOM COUNTRY'S FLAG AND SAVES COUNTRY'S DATA FOR LATER USE
const renderCountryData = async function () {
  try {
    // - empty country data container
    countryDataContainer.innerHTML = '';

    // - reseting points
    points = 21;

    // - hide country name and display points
    countryName.textContent = `${points}`;

    // selectting a random country name
    const rnd = Math.trunc(Math.random() * countryNames.length);

    // deleting it from the array to not select it again in the same game
    country = countryNames.splice(rnd, 1)[0];

    // fetching data about country from API
    const data = await fetch(
      `https://restcountries.com/v3.1/alpha/${country[1]}`
    );

    // throw error if data not ok
    if (!data.ok) throw new Error(`💣💣💣 Can't fetch country data from API`);

    // transform data to json
    const countryData = await data.json();

    // rendering flag
    flagContainer.src = countryData[0].flags.png;
    countryContainer.style.opacity = 1;

    //   creating CountryInfo array with name, capital, population, continent, language, currencies, borderCountry
    countryInfo = [
      [
        'Capital',
        countryData[0].capital ? countryData[0].capital[0] : 'no info',
      ],

      [
        'Population',
        `${(countryData[0].population / 1000000).toFixed(1)} million people`,
      ],

      ['Continent', countryData[0].region],

      [
        'Languages',
        countryData[0].languages
          ? Object.values(countryData[0].languages)
          : 'no info',
      ],

      [
        'Currency',
        countryData[0].currencies
          ? Object.values(countryData[0].currencies)[0].name
          : 'no info',
      ],

      [
        'Neighbours',
        countryData[0].borders
          ? countryData[0].borders
          : 'islands, no neighbours',
      ],
    ];
  } catch (err) {
    console.error(`💣💣💣 Error :${err.message}`);
  }
};

// 3. BUTTON HELP EVENT HANDLER
// displays a random fact about the country
const renderFact = function () {
  // choosing random fact from countryInfo object with splice
  const fact = countryInfo.splice(
    Math.trunc(Math.random() * Object.entries(countryInfo).length),
    1
  )[0];

  // render fact
  const html = `<p class="country__row"><span></span>${fact[0]}: ${fact[1]}</p>`;
  countryDataContainer.insertAdjacentHTML('afterbegin', html);

  // animate fact
  gsap.from(`.country__row`, {
    y: '-3.5rem',
    duration: 0.5,
  });

  // if facts array is empty hide help button
  if (!countryInfo[0]) {
    this.style.display = 'none';
  }

  // - decrease points
  points -= 3;
  countryName.textContent = `${points}`;
};

// reset conditions on turn end
const resetConditions = function () {
  // hiding buttons for active player
  gsap.set(`.btn__${activePlayer}`, { display: 'none' });

  // update the number of turns remaining for the current player
  turnsLeft[activePlayer] -= 1;
};

// display outcome and ads points to score if guess correct
const guessOutcome = async function () {
  if (country[0] === countriesListContainer[activePlayer].value) {
    // add quess outcome boolean element to guessOutcome array for active player
    guessValues[activePlayer].push(true);

    // - display congrats message
    outcomeAnimation(true);
  } else {
    outcomeAnimation(false);
    guessValues[activePlayer].push(false);
  }
};

// 4. BUTTON GUESS EVENT HANDLER - END TURN ACTIONS
// submits the choice made by player
const submit = async function () {
  // reseting initial conditions in preparation for switching players
  resetConditions();

  // - display country name
  countryName.textContent = country[0];

  // - display outcome message if guess correct => victory else fail
  guessOutcome();

  // display remaining turns for current player
  renderFlagIcons(activePlayer);

  await wait(2);

  if (!singlePlayer) {
    deactivatePlayer(activePlayer);

    // stop current player's timer
    clearInterval(intervalID);
  }

  // if single player at end turn, show buttons
  if (singlePlayer) activatePlayer(activePlayer);

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  // if there are no turns left then end the game
  if (turnsLeft[1] === 0) {
    clearInterval(intervalID);
    await endGame();
    return;
  }
  // single player end game condition: no turns left
  if (singlePlayer && turnsLeft[0] === 0) {
    clearInterval(intervalID);
    await endGame();
    return;
  }

  // - render new countrie
  await renderCountryData();

  // switch active player only if other player has time left (timer bigger than 0)
  if (!singlePlayer && timers[activePlayer === 0 ? 1 : 0] > 0) switchPlayer();
};

// switch player and reset new active player's initial conditions for the new turn
const switchPlayer = function () {
  // - switching active player
  activePlayer ? (activePlayer = 0) : (activePlayer = 1);

  activatePlayer(activePlayer);

  // start timer for new active player
  intervalID = setInterval(timer, 1000, activePlayer);
};

// flags graphic: displays a filled flag for every remaining turn(red or blue depending on turns outcome) and an empty one for the rest
const renderFlagIcons = function (player) {
  // reseting flag icons container
  const flagCountContainer = document.querySelectorAll('.flag__count');
  flagCountContainer[player].textContent = '';

  // function that returns flag icon source depending on guess outcome
  const flagSource = function (i) {
    let src = flagEmpty;
    if (turns - turnsLeft[player] >= i && guessValues[activePlayer][i - 1])
      src = flagFilled;
    if (turns - turnsLeft[player] >= i && !guessValues[activePlayer][i - 1])
      src = flagRed;

    return src;
  };

  // creating flag icon elements for every turn
  for (let i = 1; i <= turns; i++) {
    const html = `<img class="flag__icon" src="${flagSource(i)}" alt="" />`;
    flagCountContainer[player].insertAdjacentHTML('beforeend', html);
  }
};

// end game modal with message, animation, options
const endGame = async function () {
  // checking and assigning winner
  const winner =
    score[0] > score[1] ? playerName[0].textContent : playerName[1].textContent;

  // deactivate both players
  deactivatePlayer(0);
  deactivatePlayer(1);

  // hide turns left and timers
  flagCountContainer.forEach(cont => (cont.textContent = ''));
  timersContainer.forEach(cont => (cont.textContent = ''));

  // empty flag container
  flagContainer.src = '';

  // emptying country name
  countryName.textContent = '';

  // empty country data
  countryDataContainer.textContent = '';

  // slide in modal window
  gsap.to('.modal__window', {
    y: '0rem',
    display: 'flex',
    ease: 'circ',
    duration: 1,
  });

  // display winner
  // await renderOutcomeMessage(`WINNER: ${winner}`, 5);
};

// ----------> ANIMATIONS --------
// game intro(load) animation
const loadAnimation = async function () {
  // // Rendering flag icons in console view
  // consoleView.render(flagIcons.generateMarkUp());
  // await animations.flagAnimation();

  // Rendering title in console view
  consoleView.render(
    [gameTitle.generateMarkUp(), menuItems.generateMarkUp()].join('')
  );
  // animations.titleAnimation();

  // await wait(1.7);

  animations.menuItemsAnim();
};

// start new game animation(modal window and player section sliders in/out)
const initAnim = async function () {
  // when a two player game ended and next game will be single player -> slide back player 2
  if (singlePlayer && gsap.getProperty('.section__1', 'x') === 22)
    gsap.to('.section__1', {
      x: '-20rem',
      display: 'none',
      duration: 1,
    });

  // animate first player's section
  gsap.to('.section__0', {
    x: '-57rem',
    display: 'flex',
    duration: 1,
    ease: 'circ',
  });

  // if double player than animate other player's section
  if (!singlePlayer)
    gsap.to('.section__1', {
      x: '22rem',
      display: 'flex',
      duration: 1,
      ease: 'circ',
    });

  await wait(1);

  // slide out modal window
  consoleView.slideOut();
};

// ----------> GUESS OUTCOME ANIMATIONS -----------------
const outcomeAnimation = async function (outcome) {
  // outcome positive(true): highlight country in countries list
  if (outcome) {
    gsap.to(countriesListContainer[activePlayer], {
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
    gsap.to(scoreContainer[activePlayer], {
      scale: 1.5,
      repeat: 1,
      yoyo: true,
      yoyoEase: true,
      duration: 1,
      ease: 'power4.out',
    });

    // - add points to score counter animation
    for (let i = 1; i <= points; i++) {
      score[activePlayer] += 1;
      scoreContainer[activePlayer].textContent = score[activePlayer];
      await wait(1 / points);
    }
  }

  // outcome negative(false): country red highlight if guess missed
  else
    gsap.to(countriesListContainer[activePlayer], {
      backgroundColor: 'red',
      // fontSize: '2rem',
      // scale: 1.3,
      repeat: 1,
      ease: 'power4.out',
      yoyo: true,
      // yoyoEase: true,
      duration: 1,
    });
};

// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  numberOfPlayers();
  await initAnim();

  const player1 = new Player(0, 180, 5);
  const player2 = new Player(1, 180, 5);

  const player1View = new PlayerView(0);
  const player2View = new PlayerView(1);

  player1View.render(0);
  player2View.render(0);

  initData();

  await renderCountriesList();
  await renderCountryData();
  btnsHelp.forEach(btn => btn.addEventListener('click', renderFact));
  btnsGuess.forEach(btn => btn.addEventListener('click', submit));
};

// ----------> INIT ---------------
(async function () {
  await wait(0.5);

  await loadAnimation();

  consoleView.addHandlerRender(startNew);
})();
