import { IComponent } from '../service/ComponentService';
// import { WASDKeys } from '../game/scenes/Game';

export default class KeyboardAnimation implements IComponent {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  // private cursors: WASDKeys;
  private key: string;

  constructor(key: string) {
    // this.cursors = cursors;
    this.key = key;
  }

  init(go: Phaser.GameObjects.GameObject): void {
    this.gameObject = go as Phaser.Physics.Arcade.Sprite;
  }

  awake() {
    this.createAnims();
  }

  start() {}

  update() {}

  createAnims() {
    this.gameObject.anims.create({
      key: 'run-side',
      frames: this.gameObject.anims.generateFrameNumbers(this.key, {
        frames: [12, 13, 14, 15],
      }),
      frameRate: 15,
      repeat: -1,
    });
    this.gameObject.anims.create({
      key: 'run-up',
      frames: this.gameObject.anims.generateFrameNumbers(this.key, {
        frames: [4, 5, 6, 7],
      }),
      frameRate: 15,
      repeat: -1,
    });
    this.gameObject.anims.create({
      key: 'run-down',
      frames: this.gameObject.anims.generateFrameNumbers(this.key, {
        frames: [0, 1, 2, 3],
      }),
      frameRate: 15,
      repeat: -1,
    });
    this.gameObject.anims.create({
      key: 'idle',
      frames: this.gameObject.anims.generateFrameNumbers(this.key, {
        frames: [0],
      }),
      frameRate: 15,
      repeat: -1,
    });
  }
}
