export default class Player {
  guessValues = [];
  score = 0;
  intervalID;

  constructor(number, timeLeft, turnsLeft, active) {
    this.number = number;
    this.timeLeft = timeLeft;
    this.turnsLeft = turnsLeft;
    this.active = active;
  }
}
