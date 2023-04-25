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

gsap.registerPlugin(MotionPathPlugin);

// instantiate playerViews, one for each player
const player1View = new PlayerView(0);
const player2View = new PlayerView(1);
const playerViews = [player1View, player2View];

let intervalID;

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
    playerViews[0].renderFlags(flagSource(0));
    playerViews[1].renderFlags(flagSource(1));

    await model.loadCountriesList();
    player1View.renderCountriesList(model.state.countriesList);
    player2View.renderCountriesList(model.state.countriesList);

    playerViews[model.state.activePlayer().number].activateView();

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

  playerViews[model.state.activePlayer().number].renderTimer(
    model.state.activePlayer().timeLeft
  );

  // ----------> TIME IS UP END GAME SCENARIOS
  // if there are two players and active player's timer falls bellow 0 than change player
  if (!model.state.singlePlayer && model.state.activePlayer().timeLeft === 0) {
    // delete timer
    clearInterval(intervalID);

    // setting single player true for the rest of the game
    model.state.singlePlayer = true;

    playerViews[model.state.activePlayer().number].deactivateView();

    switchPlayer();
  }

  // if single player and timer is up end game
  if (model.state.singlePlayer && model.state.activePlayer().timeLeft === 0) {
    clearInterval(intervalID);
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

    // deleting it from the array to not select it again in the same game
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
  // choosing random fact from countryInfo object with splice
  const fact = model.state.country.facts.splice(
    Math.trunc(Math.random() * model.state.country.facts.length),
    1
  )[0];

  // render fact
  countryView.renderFact(fact);

  // if countryInfo array is empty hide help button
  if (model.state.country.facts.length === 0)
    playerViews[model.state.activePlayer().number].hideBtnHelp();

  // - decrease points
  model.state.points -= 3;
  countryView.renderName(model.state.points);
};

// display outcome and ads points to score if guess correct
const guessOutcome = async function () {
  if (
    model.state.country.name ===
    playerViews[model.state.activePlayer().number].getCountry()
  ) {
    // add quess outcome boolean element to guessOutcome array for active player
    model.state.activePlayer().guessValues.push(true);
    model.state.activePlayer().score += model.state.points;

    // - display congrats message
    await playerViews[model.state.activePlayer().number].renderScore(
      model.state.activePlayer().score
    );
  } else {
    playerViews[model.state.activePlayer().number].renderMissedAnimation();

    model.state.activePlayer().guessValues.push(false);
  }
};

// 4. BUTTON GUESS EVENT HANDLER - END TURN ACTIONS
// submits the choice made by player
const submit = async function () {
  // hiding buttons for active player
  playerViews[model.state.activePlayer().number].hideBtnGuess();
  playerViews[model.state.activePlayer().number].hideBtnHelp();

  // update the number of turns remaining for the current player
  model.state.activePlayer().turnsLeft -= 1;

  // - display country name
  countryView.renderName(model.state.country.name);

  // - display outcome message if guess correct => victory else fail
  guessOutcome();

  // display remaining turns for current player
  playerViews[model.state.activePlayer().number].renderFlags(
    flagSource(model.state.activePlayer().number)
  );

  await wait(2);

  if (!model.state.singlePlayer) {
    playerViews[model.state.activePlayer().number].deactivateView();

    // stop current player's timer
    clearInterval(intervalID);
  }

  // if single player at end turn, show buttons
  if (model.state.singlePlayer)
    playerViews[model.state.activePlayer().number].activateView();

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  // if there are no turns left then end the game
  if (model.state.player(1).turnsLeft === 0) {
    clearInterval(intervalID);
    await endGame();
    return;
  }
  // single player end game condition: no turns left
  if (model.state.singlePlayer && model.state.player(0).turnsLeft === 0) {
    clearInterval(intervalID);
    await endGame();
    return;
  }

  // - render new countrie
  await controlCountryData();

  // switch active player only if other player has time left
  if (!model.state.singlePlayer && model.state.restingPlayer().timeLeft > 0)
    switchPlayer();
};

// switch player and reset new active player's initial conditions for the new turn
const switchPlayer = function () {
  // - switching active player in state
  model.state.switchActivePlayer();

  // activate player view
  playerViews[model.state.activePlayer().number].activateView();

  // start timer for new active player
  intervalID = setInterval(timer, 1000, model.state.activePlayer().number);
};

// flags graphic: displays a filled flag for every remaining turn(red or blue depending on turns outcome) and an empty one for the rest
// function that returns flag icon source depending on guess outcome
const flagSource = function (player) {
  const sources = [];

  for (let i = 1; i <= model.state.turns; i++) {
    let src = flagEmpty;
    if (
      model.state.turns - model.state.player(player).turnsLeft >= i &&
      model.state.activePlayer().guessValues[i - 1]
    )
      src = flagFilled;
    if (
      model.state.turns - model.state.player(player).turnsLeft >= i &&
      !model.state.activePlayer().guessValues[i - 1]
    )
      src = flagRed;

    sources.push(src);
  }

  return sources;
};

// end game modal with message, animation, options
const endGame = async function () {
  playerViews.forEach(view => {
    view.deactivateView();
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
