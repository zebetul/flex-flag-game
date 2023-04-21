export const state = {
  players: [],
  country: {},

  addPlayer(player) {
    this.players.push(player);
  },

  getPlayer(playerIndex) {
    return this.players[playerIndex];
  },
};
