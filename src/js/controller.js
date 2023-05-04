import flagIcons from './flagIcons';
import menuItems from './menuItems';
import gameTitle from './gameTitle';
import { wait } from './helpers';
import { POINTS_PER_FACT } from './config';
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

  await wait(5);
  state.playerViews.forEach(view => view.slideOut());
  consoleView.slideIn();
};
const controlFact = function () {
  // if guess event allready in course or no more facts available then return
  if (state.guessEvent || state.country.facts.length === 0) return;

  state.countryView.renderFact(state.getFact());

  state.points -= POINTS_PER_FACT;
  state.countryView.renderInfo(state.points);
};
const submit = async function () {
  // if guess event allready in course then return
  if (state.guessEvent) return;
  state.guessEvent = true;

  state.countryView.renderInfo(state.country.name);
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

  if (!state.singlePlayer && state.getRestingPlayer().turnsLeft > 0)
    state.switchActivePlayer();

  state.countryView.clearFacts();
  await loadCountry();
  state.countryView.renderFlag(state.country.flag);
  state.points = 21;
  state.countryView.renderInfo(state.points);

  state.guessEvent = false;
};
// ----------> START NEW GAME -------------------------------
const startNew = async function () {
  try {
    if (state.gameEnd) state.resetConditions();

    state.saveSettings(consoleView.readGameSettings());

    // CREATE FIRST PLAYER AND IT'S VIEW
    state.addPlayer(new Player(0, state.time, state.turns, true));
    state.addPlayerView(new PlayerView(0, true, -39));

    // IF TWO PLAYER GAME, CREATE SECOND PLAYER AND IT'S VIEW
    if (!state.singlePlayer) {
      state.addPlayer(new Player(1, state.time, state.turns, false));
      state.addPlayerView(new PlayerView(1, false, 39));
    }

    await loadCountriesList();
    await loadCountry();

    // INITIALIZE PLAYER VIEWS WITH DATA AND EVENT HANDLERS AND SLIDE THEM IN GAME
    state.playerViews.forEach((view, i) => {
      view.renderFlags(state.player(i), state.turns);
      view.renderCountriesList(state.countriesList);
      view.addHandlerGuess(submit);
      view.addHandlerHelp(controlFact);
      view.slideIn();
    });

    // CREATE NEW COUNTRY VIEW AND RENDER THE FLAG AND THE POINTS
    state.countryView = new CountryView();
    state.countryView.renderFlag(state.country.flag);
    state.countryView.renderInfo(state.points);

    consoleView.slideOut();

    state.getActivePlayerView().setActive();

    controlTimer();
  } catch (err) {
    state.countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(err);
  }
};
// ----------> INIT ---------------
(async function () {
  // consoleView.render(flagIcons.generateMarkUp());
  // await flagIcons.animate();
  consoleView.render(
    [gameTitle.generateMarkUp(), menuItems.generateMarkUp()].join('')
  );
  // gameTitle.animate();
  // await wait(1.2);
  await menuItems.animate();
  consoleView.addHandlerStart(startNew);
})();
