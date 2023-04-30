import flagIcons from './flagIcons';
import menuItems from './menuItems';
import gameTitle from './gameTitle';
import { wait } from './helpers';
import * as animations from './animations';
import Player from './Player';
import { state, loadCountriesList, loadCountry } from './model';
import consoleView from './views/Console-View';
import PlayerView from './views/PlayerView';
import countryView from './views/CountryView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlTimer = async function () {
  do {
    await state
      .getActivePlayerView()
      .renderTime(state.getActivePlayer().timeLeft);

    if (state.checkGameEnd()) {
      endGame();
      return;
    }

    if (state.getActivePlayer().timeLeft === 0) {
      state.switchActivePlayer();
      // setting single player true for the rest of the game
      state.singlePlayer = true;
    }

    state.getActivePlayer().timeLeft -= 1;
  } while (!state.gameEnd);
};
const endGame = async function () {
  // reset player views
  state.playerViews.forEach(view => {
    view.setInactive();
    view.clearFlags();
    view.clearTimer();
    view.resetTimerColour();
  });

  countryView.clearFacts();

  consoleView.slideIn();
};
const controlFact = function () {
  // if no more facts available then return
  if (state.country.facts.length === 0) return;

  countryView.renderFact(state.getFact());

  state.points -= 3;
  countryView.renderName(state.points);
};
const submit = async function () {
  countryView.renderName(state.country.name);
  state.checkGuessOutcome();
  state.getActivePlayer().score += state.points;

  if (state.countryGuessed)
    await state
      .getActivePlayerView()
      .renderScore(state.getActivePlayer().score);

  if (!state.countryGuessed)
    state.getActivePlayerView().renderMissedAnimation();

  state.getActivePlayer().guessValues.push(state.countryGuessed);
  state.getActivePlayer().turnsLeft -= 1;
  state.getActivePlayerView().renderFlags(state.getActivePlayer(), state.turns);
  await wait(2);

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  if (state.checkGameEnd()) {
    await endGame();
    return;
  }

  if (!state.singlePlayer && state.restingPlayer().turnsLeft > 0)
    state.switchActivePlayer();

  countryView.clearFacts();
  await loadCountry();
  countryView.renderFlag(state.country.flag);
  state.points = 21;
  countryView.renderName(state.points);
};
// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  try {
    if (state.gameEnd) state.resetConditions();

    state.saveSettings(consoleView.readGameSettings());
    state.addPlayer(new Player(0, state.time, state.turns, true));
    state.addPlayer(new Player(1, state.time, state.turns, false));
    state.addPlayerView(new PlayerView(0, true, -39));
    state.addPlayerView(new PlayerView(1, false, 39));
    await loadCountriesList();
    // displaying turns left and countries list for each player
    state.playerViews.forEach((view, i) => {
      view.renderFlags(state.player(i), state.turns);
      view.renderCountriesList(state.countriesList);
    });

    await loadCountry();
    countryView.renderFlag(state.country.flag);
    countryView.renderName(state.points);

    // when a two player game ended and next game will be single player then slide out player 2
    if (state.singlePlayer && gsap.getProperty('.player__1', 'x') === 39)
      state.playerViews[1].slideOut();

    state.playerViews[0].slideIn();
    if (!state.singlePlayer) state.playerViews[1].slideIn();

    await wait(1);
    consoleView.slideOut();
    state.getActivePlayerView().setActive();
    controlTimer();
    // Adding event handlers to player views
    state.playerViews.forEach(view => {
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
  await wait(0.5);
  consoleView.render(flagIcons.generateMarkUp());
  await animations.flagAnimation();
  consoleView.render(
    [gameTitle.generateMarkUp(), menuItems.generateMarkUp()].join('')
  );
  animations.titleAnimation();
  await wait(1.7);
  await animations.menuItemsAnim();
  consoleView.addHandlerStart(startNew);
})();
