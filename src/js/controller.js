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
      .getActivePlayerView()
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
const endGame = async function () {
  // reset player views
  model.state.playerViews.forEach(view => {
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
  if (model.state.country.facts.length === 0) return;

  countryView.renderFact(model.state.getFact());

  model.state.points -= 3;
  countryView.renderName(model.state.points);
};
const submit = async function () {
  countryView.renderName(model.state.country.name);

  model.state.checkGuessOutcome();

  model.state.getActivePlayer().score += model.state.points;

  if (model.state.countryGuessed)
    await model.state
      .getActivePlayerView()
      .renderScore(model.state.getActivePlayer().score);

  if (!model.state.countryGuessed)
    model.state.getActivePlayerView().renderMissedAnimation();

  model.state.getActivePlayer().guessValues.push(model.state.countryGuessed);

  model.state.getActivePlayer().turnsLeft -= 1;

  model.state
    .getActivePlayerView()
    .renderFlags(model.state.getActivePlayer(), model.state.turns);

  await wait(2);

  // ---------->  NO TURNS LEFT END GAME SCENARIOS
  if (model.state.checkGameEnd()) {
    await endGame();
    return;
  }

  if (!model.state.singlePlayer && model.state.restingPlayer().turnsLeft > 0)
    model.state.switchActivePlayer();

  countryView.clearFacts();

  await model.loadCountry();

  countryView.renderFlag(model.state.country.flag);

  model.state.points = 21;
  countryView.renderName(model.state.points);
};
const initAnim = async function () {
  // when a two player game ended and next game will be single player -> slide back player 2
  if (model.state.singlePlayer && gsap.getProperty('.section__1', 'x') === 39)
    model.state.playerViews[1].slide(0);

  console.log(gsap.getProperty('.section__1', 'x'));

  // animate first player's section
  model.state.playerViews[0].slide(-39);

  // if double player than animate other player's section
  if (!model.state.singlePlayer) model.state.playerViews[1].slide(39);

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

    await model.loadCountry();

    countryView.renderFlag(model.state.country.flag);

    countryView.renderName(model.state.points);

    await initAnim();

    model.state.getActivePlayerView().setActive();

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
  // consoleView.render(flagIcons.generateMarkUp());
  // await animations.flagAnimation();
  consoleView.render(
    [gameTitle.generateMarkUp(), menuItems.generateMarkUp()].join('')
  );
  // animations.titleAnimation();
  // await wait(1.7);
  await animations.menuItemsAnim();
  consoleView.addHandlerStart(startNew);
})();
