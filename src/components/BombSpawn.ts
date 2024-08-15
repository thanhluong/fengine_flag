import Phaser, { Physics, Scene } from "phaser";
import { IComponent } from "../service/ComponentService";
import StateMachine from "../statemachine/StateMachine";
import Bomb from "../gameobjects/Bomb";
import { WASDKeys } from "../game/scenes/Game";

export default class BombSpawn implements IComponent {
  private readonly cursors: WASDKeys;
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private stateMachine: StateMachine;
  private scene: Scene;
  bombs: Physics.Arcade.StaticGroup;
  constructor(cursors: WASDKeys, bombs: Physics.Arcade.StaticGroup) {
    this.cursors = cursors;
    this.bombs = bombs;
    this.stateMachine = new StateMachine(this, "bomb_spawn");
  }
  init(go: Phaser.GameObjects.GameObject) {
    this.gameObject = go as Phaser.Physics.Arcade.Sprite;
    this.scene = this.gameObject.scene;
    this.stateMachine
      .addState("idle", {
        onEnter: this.idleOnEnter,
        onUpdate: this.idleOnUpdate,
      })
      .addState("spawn", {
        onEnter: this.spawnOnEnter,
      })
      .setState("idle");
  }
  update(dt: number) {
    this.stateMachine.update(dt);
  }
  idleOnEnter() {}
  idleOnUpdate() {
    if (this.cursors.space.isDown) {
      this.stateMachine.setState("spawn");
    }
  }
  spawnOnEnter() {
    const bomb = new Bomb(
      this.scene,
      this.gameObject.x,
      this.gameObject.y,
      "bomb"
    );

    this.bombs.add(bomb);

    // this.scene.physics.add.overlap(
    //   this.gameObject,
    //   bomb.hitBox,
    //   this.handleCollide.bind({ scene: this.scene, target: this.gameObject })
    // );

    this.scene.time.delayedCall(500, () => {
      this.stateMachine.setState("idle");
    });
  }

  // handleCollide() {
  //   console.log('Overlap');
  //   this.scene.tweens.add({
  //     targets: this.target,
  //     alpha: 0.25,
  //     duration: 100,
  //     yoyo: true,
  //     repeat: 3,
  //     onComplete: (() => {
  //       this.target.setAlpha(1);
  //     }).bind(this),
  //   });
  // }
}
