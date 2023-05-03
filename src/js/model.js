import { API_URL } from './config';
import { AJAX } from './helpers';

export const state = {
  numberOfPlayers: 0,
  time: 0,
  turns: 0,
  singlePlayer: false,
  points: 21,
  countriesList: [],
  players: [],
  playerViews: [],
  countryView: {},
  country: {},
  countryGuessed: true,
  gameEnd: false,
  winner: {},

  saveSettings(settings) {
    this.numberOfPlayers = settings.numberOfPlayers;
    if (settings.numberOfPlayers === 1) this.singlePlayer = true;
    if (settings.numberOfPlayers === 2) this.singlePlayer = false;

    this.time = settings.time;
    this.turns = settings.turns;
  },
  addPlayer(player) {
    this.players.push(player);
  },
  addPlayerView(view) {
    this.playerViews.push(view);
  },
  player(number) {
    return this.players.find(player => player.number === number);
  },
  getActivePlayer() {
    return this.players.find(player => player.active);
  },
  restingPlayer() {
    return this.players.find(player => player.active === false);
  },
  getActivePlayerView() {
    return this.playerViews[this.getActivePlayer().number];
  },
  switchActivePlayer() {
    this.getActivePlayerView().setInactive();

    // swiching active between players
    this.players.forEach(player => (player.active = !player.active));

    this.getActivePlayerView().setActive();
  },
  getFact() {
    // choosing random fact from countryInfo object with splice
    return this.country.facts.splice(
      Math.trunc(Math.random() * this.country.facts.length),
      1
    )[0];
  },
  checkGuessOutcome() {
    if (this.country.name !== this.getActivePlayerView().getCountry()) {
      this.countryGuessed = false;
      this.points = 0;
    }

    if (this.country.name === this.getActivePlayerView().getCountry())
      this.countryGuessed = true;
  },
  resetConditions() {
    // reseting guessValues
    this.players = [];
    this.playerViews = [];
    this.points = 21;
    this.guessOutcome = false;
    this.gameEnd = false;
    this.winner = {};
  },
  checkGameEnd() {
    // SINGLE PLAYER
    if (
      this.singlePlayer &&
      (this.getActivePlayer().timeLeft === 0 ||
        this.getActivePlayer().turnsLeft === 0)
    )
      return true;

    // DOUBLE PLAYER
    if (
      !this.singlePlayer &&
      ((this.getActivePlayer().timeLeft === 0 &&
        this.restingPlayer().timeLeft === 0) ||
        this.player(1).turnsLeft === 0)
    )
      return true;

    return false;
  },
  checkWinner() {
    if (this.players[0].score > this.players[1].score) return this.players[0];
    if (this.players[0].score < this.players[1].score) return this.players[1];
    return this.players[0].timeLeft > this.players[1].timeLeft
      ? this.players[0]
      : this.players[1];
  },
};

const createCountryObject = function (data) {
  return {
    name: data.name.common,
    flag: data.flags.png,
    facts: [
      ['Capital', data.capital ? data.capital[0] : 'no info'],
      [
        'Population',
        `${(data.population / 1000000).toFixed(1)} million people`,
      ],
      ['Continent', data.region],
      ['Languages', data.languages ? Object.values(data.languages) : 'no info'],
      [
        'Currency',
        data.currencies ? Object.values(data.currencies)[0].name : 'no info',
      ],
      ['Neighbours', data.borders ? data.borders : 'islands, no neighbours'],
    ],
  };
};
export const loadCountriesList = async function () {
  try {
    // getting countries list from Rest Countries API
    const countriesList = await AJAX(`${API_URL}all`);

    // extracting array with country names and cca2 [countryName, cca2] and saving it to state
    state.countriesList = countriesList
      .map(country => [country.name.common, country.cca2])
      .sort();
  } catch (err) {
    // Temporary error handling
    console.error(`Countries List Error:💥💥💥💥 ${err}`);
    throw err;
  }
};
export const loadCountry = async function () {
  try {
    // selectting a random country name
    const rnd = Math.trunc(Math.random() * state.countriesList.length);

    // extracting country and deleting it from the array to not select it again in the same game
    const country = state.countriesList.splice(rnd, 1)[0];

    const countryData = await AJAX(`${API_URL}alpha/${country[1]}`);

    state.country = createCountryObject(countryData[0]);
    // console.log(state.country);
  } catch (err) {
    // Temporary error handling
    console.error(`Country fetching Error:💥💥💥💥 ${err}`);
    throw err;
  }
};
