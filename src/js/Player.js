export default class Player {
  guessValues = [];
  score = 0;

  constructor(number, timeLeft, turnsLeft, active) {
    this.number = number;
    this.timeLeft = timeLeft;
    this.turnsLeft = turnsLeft;
    this.active = active;
  }

  setScore(score) {
    this.score = score;
  }

  getScore() {
    return this.score;
  }
}
