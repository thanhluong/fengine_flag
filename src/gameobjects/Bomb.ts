import Phaser, { Scene } from 'phaser';

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  hitBox: Phaser.Physics.Arcade.StaticGroup;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
    super(scene, x, y, key);
    scene.add.existing(this);
    this.hitBox = scene.physics.add.staticGroup({
      classType: Phaser.GameObjects.Rectangle,
    });

    // scene.time.delayedCall(1000, this.startExplode.bind(this, scene, x, y));
  }
  startExplode(scene: Scene, x: number, y: number) {
    const box = scene.add.rectangle(x, y, 16 * 3, 16 * 3, 0xfff, 0);
    this.hitBox.add(box);
    // const smoke = scene.add.sprite(x, y, 'explode').setScale(0.25);
    // smoke.anims.create({
    //   key: 'explode',
    //   frames: this.anims.generateFrameNames('explode', {
    //     start: 1,
    //     end: 10,
    //     prefix: 'Circle_explosion',
    //     suffix: '.png',
    //   }),
    //   frameRate: 20,
    //   repeat: 0,
    // });
    // smoke.play('explode');
    console.log('Exploded');
    this.destroy();

    // scene.time.delayedCall(1000, this.endExplode.bind(this, box, smoke));
  }
  // endExplode(
  //   box: Phaser.GameObjects.Rectangle,
  //   smoke: Phaser.GameObjects.Sprite
  // ) {
  //   this.hitBox.remove(box);
  //   box.destroy();
  //   smoke.destroy();
  // }
}
