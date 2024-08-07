import { ScoreArray } from "./ScoreArray";
export default class ScoreMap {
  scores: number[][];
  state: number[][];
  numberSet: Set<number> = new Set<number>();

  blockSize: number = 16;
  startPoint: [number, number] = [1, 1];
  endPoint: [number, number] = [16, 16];
  numberQuantity = 7;

  scoreArray: number[][][];
  scoreArrayInstance: ScoreArray;
  idArray: number = 5;
  defaultRed: number = 255;
  defaultGreen: number = 255;
  defaultBlue: number = 103;
  fiboNumber: number[] = [
    0, 10, 20, 30, 40, 50, 60, 100, 38, 39, 40, 41, 42, 43, 44, 45,
  ];
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
    // this.scoreArrayInstance = new ScoreArray();
    // this.scores = this.scoreArrayInstance.getScoreArray(this.idArray);
    // console.log(this.scores);
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
  createMap(scene: Phaser.Scene, tilemap: Phaser.Tilemaps.Tilemap) {
    this.scoreArrayInstance = new ScoreArray();
    this.scores = this.scoreArrayInstance.getScoreArray(this.idArray);

    // tilemap.getLayer('fence');
    const fence = tilemap.getLayer("fence")!.data;
    // console.log(fence);
    let step = 200 / this.numberQuantity;

    for (let i = this.startPoint[0]; i <= this.endPoint[0]; i++) {
      for (let j = this.startPoint[1]; j <= this.endPoint[1]; j++) {
        let count = -1;

        for (let k = 1; k <= this.numberQuantity; k++) {
          if (this.scores[i][j] === this.fiboNumber[k]) {
            count = k;
            break;
          }
        }
        let red = 200 - count * step;
        let green = 255;
        let blue = 0;

        if (this.scores[i][j] === 0 || fence[j][i].index !== -1) {
          red = this.defaultRed;
          green = this.defaultGreen;
          blue = this.defaultBlue;
        }
        scene.add
          .rectangle(
            i * 16,
            j * 16,
            16,
            16,
            Phaser.Display.Color.GetColor(red, green, blue),
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
