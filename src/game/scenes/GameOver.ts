import { Scene } from 'phaser';

export class GameOver extends Scene {
  winner: string;
  constructor() {
    super('GameOver');
  }
  init(data: any) {
    this.winner = data.result;
  }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.add
      .text(
        width * 0.5,
        height * 0.5,
        `Game over\nCongratulations 🎉\n${this.winner === 'draw' ? 'Draw' : `${this.winner} win`}`,
        {
          color: '#000',
          fontSize: 30,
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }
  update() {}
}
