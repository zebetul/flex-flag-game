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

const controlTimer = async function () {
  do {
    await model.state
      .activePlayerView()
      .renderTime(model.state.getActivePlayer().timeLeft);

    if (model.state.checkGameEnd()) {
      endGame();
      return;
    }

    if (model.state.getActivePlayer().timeLeft === 0) {
      model.state.switchActivePlayer();
      // setting single player true for the rest of the game
      model.state.singlePlayer = true;
    }

    model.state.getActivePlayer().timeLeft -= 1;
  } while (!model.state.gameEnd);
};
const controlCountryData = async function () {
  try {
    // - empty country data container
    countryView.clearFacts();

    // - reseting points
    model.state.points = 21;

    // - hide country name and display points
    countryView.renderName(model.state.points);

    await model.loadCountry();

    countryView.renderFlag(model.state.country.flag);
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(`💣💣💣 Error :${err.message}`);
  }
};
const controlFact = function () {
  // if no more facts available then return
  if (model.state.country.facts.length === 0) return;

  countryView.renderFact(model.state.getFact());

  model.state.points -= 3;
  countryView.renderName(model.state.points);
};
const controlGuessOutcome = async function () {
  if (
    model.state.country.name === model.state.activePlayerView().getCountry()
  ) {
    // add quess outcome boolean value element to guessOutcome array for active player
    model.state.getActivePlayer().guessValues.push(true);

    model.state.getActivePlayer().score += model.state.points;

    await model.state
      .activePlayerView()
      .renderScore(model.state.getActivePlayer().score);
  } else {
    model.state.getActivePlayer().guessValues.push(false);

    model.state.activePlayerView().renderMissedAnimation();
  }
};
const submit = async function () {
  countryView.renderName(model.state.country.name);

  controlGuessOutcome();

  model.state.getActivePlayer().turnsLeft -= 1;

  model.state
    .activePlayerView()
    .renderFlags(model.state.getActivePlayer(), model.state.turns);

  await wait(2);

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  if (model.state.checkGameEnd()) {
    await endGame();
    return;
  }

  if (!model.state.singlePlayer && model.state.restingPlayer().turnsLeft > 0)
    model.state.switchActivePlayer();

  await controlCountryData();
};
const endGame = async function () {
  // reset player views
  model.state.playerViews.forEach(view => {
    view.setInactive();
    view.clearFlags();
    view.clearTimer();
    view.resetTimerColour();
  });

  consoleView.slideIn();
};
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
const initAnim = async function () {
  // when a two player game ended and next game will be single player -> slide back player 2
  if (model.state.singlePlayer && gsap.getProperty('.section__1', 'x') === 22)
    model.state.playerViews[1].slide(-22);

  // animate first player's section
  model.state.playerViews[0].slide(-57);

  // if double player than animate other player's section
  if (!model.state.singlePlayer) model.state.playerViews[1].slide(22);

  await wait(1);

  // slide out modal window
  consoleView.slideOut();
};
// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  try {
    if (model.state.gameEnd) model.state.resetConditions();

    model.state.saveSettings(consoleView.readGameSettings());

    // Adding players
    model.state.addPlayer(
      new Player(0, model.state.time, model.state.turns, true)
    );
    model.state.addPlayer(
      new Player(1, model.state.time, model.state.turns, false)
    );

    // Adding a playerView for each player
    model.state.players.forEach((player, i) =>
      model.state.addPlayerView(new PlayerView(i, player.active))
    );

    await model.loadCountriesList();

    // displaying turns left and countries list for each player
    model.state.playerViews.forEach((view, i) => {
      view.renderFlags(model.state.player(i), model.state.turns);
      view.renderCountriesList(model.state.countriesList);
    });

    await controlCountryData();

    await initAnim();

    model.state.activePlayerView().setActive();

    controlTimer();

    // Adding event handlers to player views
    model.state.playerViews.forEach(view => {
      view.addHandlerGuess(submit);
      view.addHandlerHelp(controlFact);
    });
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(err);
  }
};
// ----------> INIT ---------------
(async function () {
  // await wait(0.5);

  await loadAnimation();

  consoleView.addHandlerStart(startNew);
})();
