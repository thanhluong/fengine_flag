import Phaser, { Physics, Scene } from 'phaser';
import { IComponent } from '../service/ComponentService';
import StateMachine from '../statemachine/StateMachine';
import Bomb from '../gameobjects/Bomb';

export default class InputBomb implements IComponent {
  private userInput: string = '';
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private stateMachine: StateMachine;
  private scene: Scene;
  bombs: Physics.Arcade.StaticGroup;
  constructor(bombs: Physics.Arcade.StaticGroup) {
    this.bombs = bombs;
    this.stateMachine = new StateMachine(this, 'bomb_spawn');
  }
  init(go: Phaser.GameObjects.GameObject) {
    this.gameObject = go as Phaser.Physics.Arcade.Sprite;
    this.scene = this.gameObject.scene;
    this.stateMachine
      .addState('idle', {
        onEnter: this.idleOnEnter,
        onUpdate: this.idleOnUpdate,
      })
      .addState('spawn', {
        onEnter: this.spawnOnEnter,
      })
      .setState('idle');
  }
  update(dt: number) {
    this.stateMachine.update(dt);
  }
  idleOnEnter() {}
  idleOnUpdate() {
    if (this.userInput === 'X') {
      this.stateMachine.setState('spawn');
    }
  }
  spawnOnEnter() {
    const bomb = new Bomb(
      this.scene,
      this.gameObject.x,
      this.gameObject.y,
      'bomb'
    );

    this.bombs.add(bomb);

    // this.scene.physics.add.overlap(
    //   this.gameObject,
    //   bomb.hitBox,
    //   this.handleCollide.bind({ scene: this.scene, target: this.gameObject })
    // );

    this.scene.time.delayedCall(1000, () => {
      this.stateMachine.setState('idle');
    });
  }
  importInput(inp: string) {
    this.userInput = inp;
  }
}
