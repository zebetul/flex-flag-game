import flagIcons from './flagIcons';
import menuItems from './menuItems';
import gameTitle from './gameTitle';
import { wait } from './helpers';
import * as animations from './animations';
import Player from './Player';
import * as model from './model';
import consoleView from './views/ConsoleView';
import PlayerView from './views/PlayerView';
import countryView from './views/CountryView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

gsap.registerPlugin(MotionPathPlugin);

// instantiate playerViews, one for each player
const player1View = new PlayerView(0, true);
const player2View = new PlayerView(1, false);
const playerViews = [player1View, player2View];

let intervalID;

const activePlayerView = function () {
  return playerViews[model.state.activePlayer().number];
};

// New game initial conditions (score, turns left, timers, guessValues)
const initData = async function () {
  try {
    // instantiate players from Player class

    // save players to state
    model.state.addPlayer(
      new Player(0, model.state.time, model.state.turns, true)
    );
    model.state.addPlayer(
      new Player(1, model.state.time, model.state.turns, false)
    );

    // displaying turns left for each player
    playerViews[0].renderFlags(model.state.player(0), model.state.turns);
    playerViews[1].renderFlags(model.state.player(1), model.state.turns);

    await model.loadCountriesList();
    player1View.renderCountriesList(model.state.countriesList);
    player2View.renderCountriesList(model.state.countriesList);

    activePlayerView().setActive();

    // start timer for active player
    intervalID = setInterval(timer, 1000, model.state.activePlayer().number);

    // reseting guessValues
    model.state.resetGuessValues();

    await controlCountryData();
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(err);
  }
};

// updates active player's timer decreasing it every second
const timer = function () {
  // decrease timer for active player
  model.state.activePlayer().timeLeft -= 1;

  activePlayerView().renderTime(model.state.activePlayer().timeLeft);

  // ----------> TIME IS UP END GAME SCENARIOS
  // if there are two players and active player's timer falls bellow 0 than change player
  if (!model.state.singlePlayer && model.state.activePlayer().timeLeft === 0) {
    // setting single player true for the rest of the game
    model.state.singlePlayer = true;

    switchPlayer();
  }
  // if single player and timer is up end game
  if (model.state.singlePlayer && model.state.activePlayer().timeLeft === 0) {
    endGame();
    return;
  }
  // if double player and both timers are up than end game
  if (
    !model.state.singlePlayer &&
    model.state.player(0).timeLeft === 0 &&
    model.state.player(1).timeLeft === 0
  ) {
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
    model.state.points = 21;

    // - hide country name and display points
    countryView.renderName(model.state.points);

    // selectting a random country name
    const rnd = Math.trunc(Math.random() * model.state.countriesList.length);

    // extracting country and deleting it from the array to not select it again in the same game
    const country = model.state.countriesList.splice(rnd, 1)[0];

    await model.loadCountry(country);

    countryView.renderFlag(model.state.country.flag);
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(`💣💣💣 Error :${err.message}`);
  }
};

// 3. BUTTON HELP EVENT HANDLER
// displays a random fact about the country
const renderFact = function () {
  if (model.state.country.facts.length === 0) return;

  // choosing random fact from countryInfo object with splice
  const fact = model.state.country.facts.splice(
    Math.trunc(Math.random() * model.state.country.facts.length),
    1
  )[0];

  // render fact
  countryView.renderFact(fact);

  // if countryInfo array is empty hide help button

  // - decrease points
  model.state.points -= 3;
  countryView.renderName(model.state.points);
};

const controlGuessOutcome = async function () {
  if (model.state.country.name === activePlayerView().getCountry()) {
    // add quess outcome boolean value element to guessOutcome array for active player
    model.state.activePlayer().guessValues.push(true);

    model.state.activePlayer().score += model.state.points;

    await activePlayerView().renderScore(model.state.activePlayer().score);
  } else {
    activePlayerView().renderMissedAnimation();

    model.state.activePlayer().guessValues.push(false);
  }
};

const submit = async function () {
  countryView.renderName(model.state.country.name);

  controlGuessOutcome();

  // update the number of turns remaining for the current player
  model.state.activePlayer().turnsLeft -= 1;

  // display remaining turns for current player
  activePlayerView().renderFlags(model.state.activePlayer(), model.state.turns);

  await wait(2);

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  if (model.state.singlePlayer) {
    if (model.state.player(0).turnsLeft === 0) {
      await endGame();
      return;
    } else {
      // - render new countrie
      await controlCountryData();
    }
  }

  if (!model.state.singlePlayer) {
    if (model.state.restingPlayer().turnsLeft === 0) {
      await endGame();
      return;
    } else {
      // stop current player's timer

      switchPlayer();

      // - render new countrie
      await controlCountryData();
    }
  }
};

// switch player and reset new active player's initial conditions for the new turn
const switchPlayer = function () {
  clearInterval(intervalID);

  activePlayerView().setInactive();

  // - switching active player in state
  model.state.switchActivePlayer();

  // activate player view
  activePlayerView().setActive();

  // start timer for new active player
  intervalID = setInterval(timer, 1000, model.state.activePlayer().number);
};

// end game modal with message, animation, options
const endGame = async function () {
  clearInterval(intervalID);

  playerViews.forEach(view => {
    view.setInactive();
    view.clearFlags();
    view.clearTimer();
    view.resetTimerColour();
  });

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

  await animations.menuItemsAnim();
};

// start new game animation(modal window and player section sliders in/out)
const initAnim = async function () {
  // when a two player game ended and next game will be single player -> slide back player 2
  if (model.state.singlePlayer && gsap.getProperty('.section__1', 'x') === 22)
    player2View.slide(-22);

  // animate first player's section
  player1View.slide(-57);

  // if double player than animate other player's section
  if (!model.state.singlePlayer) player2View.slide(22);

  await wait(1);

  // slide out modal window
  consoleView.slideOut();
};

// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  model.state.saveSettings(consoleView.readGameSettings());

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
