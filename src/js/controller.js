import 'core-js/stable';
import 'regenerator-runtime';

import flagIcons from './flagIcons';
import { wait } from './helpers';
import * as animations from './animations';
import gameTitle from './gameTitle';
import menuItems from './menuItems';
import { menuItemsAnim } from './animations';

import Player from './Player';
import consoleView from './views/ConsoleView';
import PlayerView from './views/PlayerView';
import countryView from './views/CountryView';
import * as model from './model';

import flagFilled from 'url:/assets/icons/flag-filled.png';
import flagRed from 'url:/assets/icons/flag-red.png';
import flagEmpty from 'url:/assets/icons/flag-empty.png';
import { async } from 'regenerator-runtime';

gsap.registerPlugin(MotionPathPlugin);

// instantiate players from Player class
const player1 = new Player(0, 300, 10);
const player2 = new Player(1, 180, 5);

// instantiate playerViews, one for each player
const player1View = new PlayerView(0);
const player2View = new PlayerView(1);
const playerViews = [player1View, player2View];

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

// assingns singlePlayer's value boolean value depending wich option was checked
const numberOfPlayers = function () {
  // setting sinlePlayer boolen value
  if (document.querySelector('.player__1').checked) singlePlayer = true;
  if (document.querySelector('.player__2').checked) singlePlayer = false;
};

// New game initial conditions (score, turns left, timers, guessValues)
const initData = async function () {
  try {
    // setting player1 as active
    activePlayer = 0;

    playerViews[activePlayer].activatePlayer();

    // start timer for active player
    intervalID = setInterval(timer, 1000, activePlayer);

    // setting score for each player
    score[0] = score[1] = 0;

    // setting turns left for each player
    turnsLeft[0] =
      turnsLeft[1] =
      turns =
        document.querySelector('input[name="flags"]:checked').value;

    // displaying turns left for each player
    playerViews[0].renderFlags(flagSource(0));
    playerViews[1].renderFlags(flagSource(1));

    //   setting timers for each player
    timers[0] = timers[1] =
      document.querySelector('input[name="time"]:checked').value * 60;

    // reseting guessValues
    guessValues[0].length = guessValues[1].length = 0;

    // save players to state
    model.state.addPlayer(player1);
    model.state.addPlayer(player2);

    await model.loadCountriesList();
    player1View.renderCountriesList(model.state.countriesList);
    player2View.renderCountriesList(model.state.countriesList);

    await controlCountryData();
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(err);
  }
};

// updates active player's timer decreasing it every second
const timer = function () {
  // decrease timer for active player
  timers[activePlayer] -= 1;

  playerViews[activePlayer].renderTimer(timers[activePlayer]);

  // ----------> TIME IS UP END GAME SCENARIOS
  // if there are two players and active player's timer falls bellow 0 than change player
  if (!singlePlayer && timers[activePlayer] === 0) {
    // delete timer
    clearInterval(intervalID);

    // setting single player true for the rest of the game
    singlePlayer = true;

    playerViews[activePlayer].deactivatePlayer();

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

// 2. DISPLAYS A RANDOM COUNTRY'S FLAG AND SAVES COUNTRY'S DATA FOR LATER USE
const controlCountryData = async function () {
  try {
    // - empty country data container
    countryView.clearFacts();

    // - reseting points
    points = 21;

    // - hide country name and display points
    countryView.renderName(points);

    // selectting a random country name
    const rnd = Math.trunc(Math.random() * model.state.countriesList.length);

    // deleting it from the array to not select it again in the same game
    country = model.state.countriesList.splice(rnd, 1)[0];

    // fetching data about country from API
    const data = await fetch(
      `https://restcountries.com/v3.1/alpha/${country[1]}`
    );

    // throw error if data not ok
    if (!data.ok) throw new Error(`💣💣💣 Can't fetch country data from API`);

    // transform data to json
    const countryData = await data.json();

    // rendering flag
    countryView.renderFlag(countryData[0].flags.png);

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
    countryView.render(`💣💣💣 Something went wrong:${err}`);
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
  countryView.renderFact(fact);

  // if countryInfo array is empty hide help button
  if (countryInfo.length === 0) playerViews[activePlayer].hideBtnHelp();

  // - decrease points
  points -= 3;
  countryView.renderName(points);
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
  if (country[0] === playerViews[activePlayer].getCountry()) {
    // add quess outcome boolean element to guessOutcome array for active player
    guessValues[activePlayer].push(true);

    // - display congrats message
    await playerViews[activePlayer].renderScore(5);
  } else {
    playerViews[activePlayer].renderMissedAnimation();

    guessValues[activePlayer].push(false);
  }
};

// 4. BUTTON GUESS EVENT HANDLER - END TURN ACTIONS
// submits the choice made by player
const submit = async function () {
  // reseting initial conditions in preparation for switching players
  resetConditions();

  // - display country name
  countryView.renderName(country[0]);

  // - display outcome message if guess correct => victory else fail
  guessOutcome();

  // display remaining turns for current player
  playerViews[activePlayer].renderFlags(flagSource(activePlayer));

  await wait(2);

  if (!singlePlayer) {
    playerViews[activePlayer].deactivatePlayer();

    // stop current player's timer
    clearInterval(intervalID);
  }

  // if single player at end turn, show buttons
  if (singlePlayer) playerViews[activePlayer].activatePlayer();

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
  await controllCountryData();

  // switch active player only if other player has time left (timer bigger than 0)
  if (!singlePlayer && timers[activePlayer === 0 ? 1 : 0] > 0) switchPlayer();
};

// switch player and reset new active player's initial conditions for the new turn
const switchPlayer = function () {
  // - switching active player
  activePlayer ? (activePlayer = 0) : (activePlayer = 1);

  playerViews[activePlayer].activatePlayer();

  // start timer for new active player
  intervalID = setInterval(timer, 1000, activePlayer);
};

// flags graphic: displays a filled flag for every remaining turn(red or blue depending on turns outcome) and an empty one for the rest
// function that returns flag icon source depending on guess outcome
const flagSource = function (player) {
  const sources = [];

  for (let i = 1; i <= turns; i++) {
    let src = flagEmpty;
    if (turns - turnsLeft[player] >= i && guessValues[activePlayer][i - 1])
      src = flagFilled;
    if (turns - turnsLeft[player] >= i && !guessValues[activePlayer][i - 1])
      src = flagRed;

    sources.push(src);
  }

  return sources;
};

// playerViews[activePlayer].renderFlags(flagSource());

// end game modal with message, animation, options
const endGame = async function () {
  // deactivate both players
  playerViews[0].deactivatePlayer();
  playerViews[1].deactivatePlayer();

  // clearing turns left and timers and reseting timers color back to blue
  playerViews.forEach(view => {
    view.clearFlags();
    view.clearTimer();
    view.resetTimerColour();
  });

  // slide in modal window
  consoleView.slideIn();
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
    player2View.slide(-22);

  // animate first player's section
  player1View.slide(-57);

  // if double player than animate other player's section
  if (!singlePlayer) player2View.slide(22);

  await wait(1);

  // slide out modal window
  consoleView.slideOut();
};

// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  numberOfPlayers();
  await initAnim();
  await initData();

  playerViews.forEach(view => view.addHandlerGuess(submit));
  playerViews.forEach(view => view.addHandlerHelp(renderFact));
};

// ----------> INIT ---------------
(async function () {
  // await wait(0.5);

  await loadAnimation();

  consoleView.addHandlerStart(startNew);
})();
