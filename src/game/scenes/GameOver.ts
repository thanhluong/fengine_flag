import { Scene } from 'phaser';

export class GameOver extends Scene {
  winner: string;
  scorePlayer1: number;
  scorePlayer2: number;

  constructor() {
    super('GameOver');
  }
  init(data: any) {
    this.winner = data.result;
    this.scorePlayer1 = data.scorePlayer1;
    this.scorePlayer2 = data.scorePlayer2;
  }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.add
      .text(
        width * 0.5,
        height * 0.3,
        `Game Over!\nCongratulations 🎉\n${this.winner === 'draw' ? `It's a tie!` : `${this.winner} win\n`}`,
        {
          color: '#000',
          fontSize: 30,
          align: 'center',
        }
      )
      .setOrigin(0.5);
      this.add.text(width * 0.5, height * 0.6 , `Player 1: ${this.scorePlayer1}`, {color: '#000', fontSize: 20, align: 'center'}).setOrigin(0.5);
      this.add.text(width * 0.5, height * 0.7,  `Player 2: ${this.scorePlayer2}`, {color: '#000', fontSize: 20, align: 'center'}).setOrigin(0.5);
  }

  update() {}
}
