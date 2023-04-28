import { AJAX } from './helpers';

export const state = {
  numberOfPlayers: 0,
  time: 0,
  turns: 0,
  activePlayer: 0,
  singlePlayer: false,
  points: 21,
  countriesList: [],
  players: [],
  country: {},
  gameEnd: false,

  saveSettings(settings) {
    this.numberOfPlayers = settings.numberOfPlayers;
    this.time = settings.time;
    this.turns = settings.turns;

    if (this.numberOfPlayers === 1) this.singlePlayer = true;
  },
  addPlayer(player) {
    this.players.push(player);
  },
  player(number) {
    return this.players.find(player => player.number === number);
  },
  activePlayer() {
    return this.players.find(player => player.active);
  },
  restingPlayer() {
    return this.players.find(player => player.active === false);
  },
  switchActivePlayer() {
    this.players.forEach(player => (player.active = !player.active));
  },
  resetConditions() {
    // reseting guessValues
    this.players.forEach(player => (player.guessValues = []));
    this.players.forEach(player => (player.score = 0));
    this.activePlayer = 0;
    this.points = 21;
    this.gameEnd = false;
  },
  checkGameEnd() {
    if (
      this.singlePlayer &&
      (this.activePlayer().timeLeft === 0 ||
        this.activePlayer().turnsLeft === 0)
    )
      this.gameEnd = true;

    if (
      !this.singlePlayer &&
      ((this.activePlayer().timeLeft === 0 &&
        this.restingPlayer().timeLeft === 0) ||
        this.player(1).turnsLeft === 0)
    )
      this.gameEnd = true;

    return this.gameEnd;
  },
  getFact() {
    // choosing random fact from countryInfo object with splice
    return this.country.facts.splice(
      Math.trunc(Math.random() * this.country.facts.length),
      1
    )[0];
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
    const countriesList = await AJAX('https://restcountries.com/v3.1/all');

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

    const countryData = await AJAX(
      `https://restcountries.com/v3.1/alpha/${country[1]}`
    );

    state.country = createCountryObject(countryData[0]);
  } catch (err) {
    // Temporary error handling
    console.error(`Country fetching Error:💥💥💥💥 ${err}`);
    throw err;
  }
};
