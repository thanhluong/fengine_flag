import Phaser from 'phaser';

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  hitBox: Phaser.Physics.Arcade.StaticGroup;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
    super(scene, x, y, key);
    scene.add.existing(this);
    this.hitBox = scene.physics.add.staticGroup({
      classType: Phaser.GameObjects.Rectangle,
    });
    this.setScale(0.5);
  }
}
