import { AJAX } from './helpers';

export const state = {
  countriesList: [],
  players: [],
  country: {},

  addPlayer(player) {
    this.players.push(player);
  },

  getPlayer(playerIndex) {
    return this.players[playerIndex];
  },
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
