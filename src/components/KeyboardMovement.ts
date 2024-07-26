import { IComponent } from '../service/ComponentService';
import { WASDKeys } from '../game/scenes/Game';

export default class KeyboardMovement implements IComponent {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private readonly cursors: WASDKeys;
  private readonly speed = 100;
  constructor(cursors: WASDKeys) {
    this.cursors = cursors;
  }

  init(go: Phaser.GameObjects.GameObject) {
    this.gameObject = go as Phaser.Physics.Arcade.Sprite;
  }
  update() {
    if (this.cursors.left.isDown) {
      this.gameObject.setVelocity(-this.speed, 0);
    } else if (this.cursors.right.isDown) {
      this.gameObject.setVelocity(this.speed, 0);
    } else if (this.cursors.up.isDown) {
      this.gameObject.setVelocity(0, -this.speed);
    } else if (this.cursors.down.isDown) {
      this.gameObject.setVelocity(0, this.speed);
    } else {
      this.gameObject.setVelocity(0, 0);
    }
  }
}
