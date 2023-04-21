export default class Player {
  score = 0;

  constructor(number, timer, turnsLeft) {
    this.number = number;
    this.timer = timer;
    this.turnsLeft = turnsLeft;
  }
}
