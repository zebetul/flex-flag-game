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

// 1. PUT A LIST WITH ALL COUNTRIES IN EACH PLAYER'S FIELD
export const loadCountriesList = async function () {
  try {
    // getting countries list from Rest Countries API
    const res = await fetch('https://restcountries.com/v3.1/all'); // try: https://restcountries.com/v3.1/all?fields=name

    // transforming to JSON
    const countriesList = await res.json();

    if (!res.ok) throw new Error(countriesList);

    // extracting array with country names and cca2 [countryName, cca2]
    state.countriesList = countriesList
      .map(country => [country.name.common, country.cca2])
      .sort();
  } catch (err) {
    countryView.render(`💣💣💣 Something went wrong:${err}`);
    console.error(`💣💣💣 Something went wrong:${err}`);
  }
};
