import { Pair } from "matter";

export default class ScoreMap {
  scores: number[][];
  state: number[][];
  numberSet: Set<number> = new Set<number>();

  blockSize: 16;
  startPoint: [number, number] = [4, 4];
  endPoint: [number, number] = [13, 13];

  constructor() {
    this.scores = [];
    this.state = [];

    for (let i = 0; i < 20; i++) {
      this.scores[i] = [];
      this.state[i] = [];
      for (let j = 0; j < 20; j++) {
        this.scores[i][j] = 0;
        this.state[i][j] = 0;
      }
    }
    this.create();
  }
  create() {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        this.scores[i][j] = Phaser.Math.Between(0, 100);
      }
    }
  }
  getScoreMap() {
    return this.scores;
  }
  getMapState() {
    return this.state;
  }
  getPointScore(x: number, y: number) {
    return this.scores[(x - this.blockSize / 2) / this.blockSize][
      (y - this.blockSize / 2) / this.blockSize
    ];
  }
  getPointState(x: number, y: number) {
    return this.state[(x - this.blockSize / 2) / this.blockSize][
      (y - this.blockSize / 2) / this.blockSize
    ];
  }
  createMap(scene: Phaser.Scene) {
    for (let i = this.startPoint[0]; i <= this.endPoint[0]; i++) {
      for (let j = this.startPoint[1]; j <= this.endPoint[1]; j++) {
        this.numberSet.add(this.scores[i][j]);
      }
    }
    let step = 200 / this.numberSet.size;

    for (let i = this.startPoint[0]; i <= this.endPoint[0]; i++) {
      for (let j = this.startPoint[1]; j <= this.endPoint[1]; j++) {
        let count = -1;

        for (let k of this.numberSet) {
          if (this.scores[i][j] == k) {
            break;
          }
          count++;
        }
        scene.add
          .rectangle(
            i * 16,
            j * 16,
            16,
            16,
            Phaser.Display.Color.GetColor(255, 200 - count * step, 0)
          )
          .setOrigin(0, 0);
      }
    }
  }
  setState(x: number, y: number, state: number) {
    this.state[(x - this.blockSize / 2) / this.blockSize][
      (y - this.blockSize / 2) / this.blockSize
    ] = state;
  }
  getScore(type: number) {
    let score = 0;
    for (let i = this.startPoint[0]; i <= this.endPoint[0]; i++) {
      for (let j = this.startPoint[1]; j <= this.endPoint[1]; j++) {
        if (this.state[i][j] == type) score += this.scores[i][j];
      }
    }
    return score;
  }
  getEndPoint() {
    return this.endPoint;
  }
  getStartPoint() {
    return this.startPoint;
  }
  getBlockSize() {
    return this.blockSize;
  }
}
