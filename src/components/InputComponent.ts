import { IComponent } from "../service/ComponentService";

const baseMoveDist = 16;
const baseMoveTime = 300;

export default class InputComponent implements IComponent {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  fences: Phaser.Tilemaps.TilemapLayer;
  userInput: string = "";
  speed: number = 100;
  init(go: Phaser.Physics.Arcade.Sprite) {
    this.gameObject = go;
  }
  constructor(
    fences: Phaser.Tilemaps.TilemapLayer,
    go: Phaser.Physics.Arcade.Sprite
  ) {
    this.fences = fences;
    this.init(go);
  }
  async update() {
    if (this.userInput !== "") {
      await this.render(this.userInput);
      this.userInput = "";
    }
  }
  importInput(inp: string) {
    this.userInput = inp;
  }
  render(inp: string) {
    const { scene } = this.gameObject;
    let nextPostition = {
      x: this.gameObject.x,
      y: this.gameObject.y,
    };
    let key = "idle";
    // console.log(inp);
    if (inp === "L") {
      nextPostition.x -= baseMoveDist;
      key = "run-side";
      this.gameObject.setFlipX(true);
    } else if (inp === "R") {
      nextPostition.x += baseMoveDist;
      key = "run-side";
      this.gameObject.setFlipX(false);
    } else if (inp === "U") {
      nextPostition.y -= baseMoveDist;
      key = "run-up";
    } else if (inp === "D") {
      nextPostition.y += baseMoveDist;
      key = "run-down";
    } else if (inp === "X") {
      key = "idle";
    }
    const tile = this.fences.getTileAtWorldXY(nextPostition.x, nextPostition.y);
    if (tile == null) {
      return new Promise((resolve, _) => {
        scene.tweens.add({
          targets: this.gameObject,
          x: nextPostition.x,
          y: nextPostition.y,
          duration: baseMoveTime,
          onUpdate: this.playAnim.bind(this, key),
          onComplete: this.resolveAnimation.bind(_, resolve, this.gameObject),
        });
      });
    } else {
      return new Promise((resolve, _) => {
        scene.tweens.add({
          targets: this.gameObject,
          x: this.gameObject.x,
          y: this.gameObject.y,
          duration: baseMoveTime,
          onUpdate: this.playAnim.bind(this, "idle"),
          onComplete: resolve,
        });
      });
    }
    // if (tile == null) {
    //   scene.tweens.add({
    //     targets: this.gameObject,
    //     x: nextPostition.x,
    //     y: nextPostition.y,
    //     duration: baseMoveTime,
    //     onUpdate: this.playAnim.bind(this, key),
    //     onComplete: this.playAnim.bind(this, "idle"),
    //   });
    //   // console.log(nextPostition.x, nextPostition.y);
    // } else {
    //   scene.tweens.add({
    //     targets: this.gameObject,
    //     x: this.gameObject.x,
    //     y: this.gameObject.y,
    //     duration: baseMoveTime,
    //     onUpdate: this.playAnim.bind(this, "idle"),
    //   });
    // }
  }
  playAnim(key: string) {
    // console.log(this.gameObject);
    key && this.gameObject.play(key, true);
  }
  resolveAnimation(
    resolve: (value: unknown) => void,
    gameObject: Phaser.Physics.Arcade.Sprite
  ) {
    gameObject.play("idle");
    resolve("");
  }
}
