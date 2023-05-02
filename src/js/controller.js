import flagIcons from './flagIcons';
import menuItems from './menuItems';
import gameTitle from './gameTitle';
import { wait } from './helpers';
import Player from './Player';
import { state, loadCountriesList, loadCountry } from './model';
import consoleView from './views/Console-View';
import PlayerView from './views/PlayerView';
import CountryView from './views/CountryView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlTimer = async function () {
  while (!state.gameEnd) {
    await state
      .getActivePlayerView()
      .renderTime(state.getActivePlayer().timeLeft);

    if (state.checkGameEnd()) {
      await endGame();
      state.gameEnd = true;
      return;
    }

    if (state.getActivePlayer().timeLeft === 0) {
      state.switchActivePlayer();
      // setting single player true for the rest of the game
      state.singlePlayer = true;
    }

    state.getActivePlayer().timeLeft -= 1;
  }
};
const endGame = async function () {
  if (state.gameEnd) return;

  // reset player views
  state.playerViews.forEach(view => {
    view.setInactive();
    view.clearFlags();
    view.clearTimer();
    view.resetTimerColour();
  });

  state.winner = state.checkWinner();

  state.countryView.render(flagIcons.generateMarkUp());
  state.countryView.renderWinner(state.winner.number + 1, state.winner.score);
  flagIcons.fireWork();

  // await wait(2);
  // consoleView.slideIn();
};
const controlFact = function () {
  // if no more facts available then return
  if (state.country.facts.length === 0) return;

  state.countryView.renderFact(state.getFact());

  state.points -= 3;
  state.countryView.renderName(state.points);
};
const submit = async function () {
  state.countryView.renderName(state.country.name);
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
    state.gameEnd = true;
    await endGame();
    return;
  }

  if (!state.singlePlayer && state.restingPlayer().turnsLeft > 0)
    state.switchActivePlayer();

  state.countryView.clearFacts();
  await loadCountry();
  state.countryView.renderFlag(state.country.flag);
  state.points = 21;
  state.countryView.renderName(state.points);
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
    state.countryView = new CountryView();
    state.countryView.renderFlag(state.country.flag);
    state.countryView.renderName(state.points);

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
    state.countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(err);
  }
};
// ----------> INIT ---------------
(async function () {
  // await wait(1);
  // consoleView.render(flagIcons.generateMarkUp());
  // await flagIcons.animate();
  consoleView.render(
    [gameTitle.generateMarkUp(), menuItems.generateMarkUp()].join('')
  );
  gameTitle.animate();
  await wait(0.8);
  await menuItems.animate();
  consoleView.addHandlerStart(startNew);
})();
