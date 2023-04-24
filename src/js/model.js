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

export const loadCountry = async function (country) {
  try {
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
