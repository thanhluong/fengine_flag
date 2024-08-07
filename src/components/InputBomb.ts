import Phaser, { Physics, Scene } from "phaser";
import { IComponent } from "../service/ComponentService";
import StateMachine from "../statemachine/StateMachine";
import Bomb from "../gameobjects/Bomb";
import ScoreMap from "./ScoreMap";

const wait = function (time: number) {
  return new Promise(function (resolve, _) {
    setTimeout(resolve, time);
  });
};

export default class InputBomb implements IComponent {
  private userInput: string = "";
  private enemyInput: string = "";
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private enemy: Phaser.Physics.Arcade.Sprite;
  private stateMachine: StateMachine;
  private scene: Scene;
  private scoreMap: ScoreMap;
  private delaySpawn: number;
  key: string;
  bombs: Physics.Arcade.StaticGroup;
  enemyBombs: Physics.Arcade.StaticGroup;
  constructor(
    bombs: Physics.Arcade.StaticGroup,
    enemyBombs: Physics.Arcade.StaticGroup,
    enemy: Phaser.Physics.Arcade.Sprite,
    key: string,
    scroreMap: ScoreMap
  ) {
    this.bombs = bombs;
    this.enemyBombs = enemyBombs;
    this.enemy = enemy;
    this.key = key;
    this.scoreMap = scroreMap;
    this.stateMachine = new StateMachine(this, "bomb_spawn");
    this.delaySpawn = 1500;
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
    if (this.userInput === "X") {
      console.log("Start set bomb");
      this.userInput = "";
      this.stateMachine.setState("spawn");
    }
  }
  spawnOnEnter() {
    // this.scene.time.delayedCall(1500, () => {
    //   this.stateMachine.setState("idle");
    // });
    wait(this.delaySpawn).then(() => this.stateMachine.setState("idle"));
    if (
      this.checkEnemyAt(this.gameObject.x, this.gameObject.y) &&
      this.enemyInput === "X"
    )
      return; // 2 player cannot spawn bomb at the same time and place
    const enemyBomb = this.getEnemyBomb(this.gameObject.x, this.gameObject.y);
    if (this.key === "bomb") {
      this.scoreMap.setState(this.gameObject.x, this.gameObject.y, 1);
    } else if (this.key === "flag-blue") {
      this.scoreMap.setState(this.gameObject.x, this.gameObject.y, 2);
    }
    if (enemyBomb) console.log("Overlap");
    enemyBomb?.destroy();
    if (!this.checkBombAt(this.gameObject.x, this.gameObject.y)) {
      const bomb = new Bomb(
        this.scene,
        this.gameObject.x,
        this.gameObject.y,
        this.key
      );
      this.bombs.add(bomb);
    }
  }
  importInput(userInput: string, enemyInput: string) {
    this.userInput = userInput;
    this.enemyInput = enemyInput;
    // console.log('Bom:', inp);
  }
  checkBombAt(x: number, y: number) {
    const bombs = this.bombs.getChildren();
    let res = false;
    bombs.forEach(b => {
      const bomb = b as Phaser.Physics.Arcade.Sprite;
      // console.log(bomb);
      if (bomb.x === x && bomb.y === y) {
        // console.log('Has bomb');
        res = true;
      }
    });
    return res;
  }
  getEnemyBomb(x: number, y: number) {
    const bombs = this.enemyBombs.getChildren();
    let res!: Phaser.Physics.Arcade.Sprite;
    bombs.forEach(b => {
      const bomb = b as Phaser.Physics.Arcade.Sprite;
      // console.log(bomb);
      if (bomb.x === x && bomb.y === y) {
        // console.log('Has bomb');
        res = bomb;
      }
    });
    return res;
  }
  checkEnemyAt(x: number, y: number) {
    return this.enemy.x === x && this.enemy.y === y;
  }
}
