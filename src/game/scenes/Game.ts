import { Scene, Physics } from "phaser";
import ComponentService from "../../service/ComponentService";
import KeyboardMovement from "../../components/KeyboardMovement";
import KeyboardAnimation from "../../components/KeyboardAnimation";
import Bomb from "../../gameobjects/Bomb";
import InputComponent from "../../components/InputComponent";
import InputBomb from "../../components/InputBomb";
import ScoreMap from "../../components/ScoreMap.ts";
import axios from "axios";
// import {c} from "vite/dist/node/types.d-aGj9QkWt";

const mapIndex = 5;
const updateDelay = 3000;
const moveDelay = 450;
const startCoords = [
  [2, 3],
  [2, 8],
  [1, 8],
];
const seperator = "|";
export interface WASDKeys {
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
}

const EXECUTOR_URL = import.meta.env.VITE_EXECUTOR_URL as string;

const arr = ["L", "R", "U", "D", "X"];
const tileSz = 16;

const wait = function (time: number) {
  return new Promise(function (resolve, _) {
    setTimeout(resolve, time);
  });
};

export class Game extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  components: ComponentService;
  player1: Physics.Arcade.Sprite;
  player2: Physics.Arcade.Sprite;
  enemy: Physics.Arcade.Sprite;
  fences: Phaser.Tilemaps.TilemapLayer;
  grass: Phaser.Tilemaps.TilemapLayer;
  bombs: Physics.Arcade.StaticGroup;
  bombs2: Physics.Arcade.StaticGroup;
  userInput: string = "";
  inputComponent: InputComponent;
  inputComponent2: InputComponent;
  inputBomb: InputBomb;
  inputBomb2: InputBomb;
  scoreMap: ScoreMap;
  textStepHeader: Phaser.GameObjects.Text;
  textStepContent: Phaser.GameObjects.Text;
  step = 0;
  textP1Header: Phaser.GameObjects.Text;
  textP1: Phaser.GameObjects.Text;
  textP2Header: Phaser.GameObjects.Text;
  textP2: Phaser.GameObjects.Text;
  textNoti: Phaser.GameObjects.Text;
  ok: boolean = true;
  isPause: boolean = true;
  output: string[] = [];
  map: Phaser.Tilemaps.Tilemap;
  state: number[][];
  inputForA: string;
  inputForB: string;
  movementA: string = "";
  movementB: string = "";
  totalStep = 64;
  beginPosition1 = [1, 1];
  beginPosition2 = [1, 1];
  stringLength: number = 3;
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.tilemapTiledJSON(
      "tilemap",
      `Tilemap/tilemap16x16ver${mapIndex}.json`
    );
    this.load.image("grass-ts", "Tilemap/Grass.png");
    this.load.image("fences-ts", "Tilemap/Fences.png");
    this.load.image("bomb", "Character/bomb.png");
    this.load.image("flag-blue", "Character/flag-blue.png");
    this.load.spritesheet("cute1", "Character/cute1.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("cute2", "Character/cute2.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    // const { width, height } = this.scale;
    // Create platform
    this.movementA = "";
    this.movementB = "";
    localStorage.setItem("codeA", "");
    localStorage.setItem("codeB", "");
    localStorage.setItem("binaryCodeA", "");
    localStorage.setItem("binaryCodeB", "");

    this.state = [];
    this.movementB = "";
    this.movementA = "";
    this.map = this.make.tilemap({ key: "tilemap" });
    const grassTileset = this.map.addTilesetImage("Grass", "grass-ts");
    const fencesTileset = this.map.addTilesetImage("Fences", "fences-ts");
    this.grass = this.map.createLayer("grass", grassTileset!)!;
    this.scoreMap = new ScoreMap();
    this.scoreMap.create();
    this.scoreMap.createMap(this, this.map);
    this.fences = this.map.createLayer("fence", fencesTileset!)!;
    this.renderBorder(this.grass);

    // Add player info text
    this.textStepHeader = this.add.text(310, 30, "Step", {
      color: "#000",
      fontStyle: "900",
      fontSize: "18px",
    });
    this.textStepContent = this.add.text(310, 50, "", {
      color: "#000",
      // fontStyle: '900',
      fontSize: 18,
    });
    this.textStepContent.setText(`${this.step}/${this.totalStep}`);
    this.textP1Header = this.add.text(310, 80, "PLAYER", {
      color: "#000",
      fontStyle: "900",
      fontSize: 12,
    });
    this.add.image(340, 85, "cute1").setOrigin(0, 0.5);
    this.textP1 = this.add.text(310, 80, "\nScore:0\nMove:", {
      color: "#000",
      fontSize: 12,
    });
    this.textP2Header = this.add.text(310, 140, "PLAYER", {
      color: "#000",
      fontStyle: "900",
      fontSize: 12,
    });
    this.add.image(340, 145, "cute2").setOrigin(0, 0.5);
    this.textP2 = this.add.text(310, 140, "\nScore:0\nMove:", {
      color: "#000",
      fontSize: 12,
    });
    this.textNoti = this.add.text(300, 240, "Press SPACE\nto start", {
      color: "#000",
      fontSize: 12,
      align: "center",
    });
    // Create sprite
    // PLAYER 1
    let endPoint = this.scoreMap.getEndPoint();
    let startPoint = this.scoreMap.getStartPoint();

    this.player1 = this.physics.add.sprite(
      tileSz * endPoint[1] + tileSz * 0.5,
      tileSz * endPoint[1] + tileSz * 0.5,
      "cute1"
    );
    this.player1
      .setBodySize(this.player1.width / 3, this.player1.height / 3)
      .setDepth(10);
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.bombs = this.physics.add.staticGroup({ classType: Bomb });
    // PLAYER 2
    this.player2 = this.physics.add.sprite(
      tileSz * endPoint[1] + tileSz * 0.5,
      tileSz * endPoint[1] + tileSz * 0.5,
      "cute2"
    );
    this.player2
      .setBodySize(this.player2.width / 3, this.player2.height / 3)
      .setDepth(10);
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.bombs2 = this.physics.add.staticGroup({ classType: Bomb });
    // Implement collision
    this.fences?.setCollisionByProperty({ collide: true });
    this.physics.add.collider(this.player1, this.fences);
    this.physics.add.collider(this.player2, this.fences);
    // Implement components
    this.components = new ComponentService();
    this.components.addComponent(this.player1, new KeyboardAnimation("cute1"));
    this.inputBomb = new InputBomb(
      this.bombs,
      this.bombs2,
      this.player2,
      "bomb",
      this.scoreMap
    );
    this.components.addComponent(this.player1, this.inputBomb);
    this.inputComponent = new InputComponent(this.fences);
    this.components.addComponent(this.player1, this.inputComponent);

    // Add player2 components
    this.components.addComponent(
      this.player2,
      new KeyboardMovement(this.cursors)
    );
    this.components.addComponent(
      this.player2,
      new KeyboardMovement(this.cursors)
    );
    this.components.addComponent(this.player2, new KeyboardAnimation("cute2"));
    this.inputBomb2 = new InputBomb(
      this.bombs2,
      this.bombs,
      this.player1,
      "flag-blue",
      this.scoreMap
    );
    this.components.addComponent(this.player2, this.inputBomb2);
    this.inputComponent2 = new InputComponent(this.fences);
    this.components.addComponent(this.player2, this.inputComponent2);
  }
  checkInput(input: string) {
    if (input.length > this.stringLength) return false;
    if (!input.length) return false;
    let count = 0;
    let letter = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === "X") count++;
      for (let j = 0; j < arr.length; j++) {
        if (input[i] === arr[j]) letter++;
      }
    }
    if (letter != input.length) return false;
    if (count > 1) return false;
    if (count === 1) {
      if (input.length > 1) return false;
    }
    return true;
  }
  processInput(id: number) {
    this.output[id] = this.output[id].trimEnd();

    const canMove = (id: number) => {
      let x = this.player1.x;
      let y = this.player1.y;
      if (id === 2) {
        x = this.player2.x;
        y = this.player2.y;
      }
      for (let i = 0; i < this.output[id].length; i++) {
        if (this.output[id][i] === "L") x -= tileSz;
        if (this.output[id][i] === "R") x += tileSz;
        if (this.output[id][i] === "U") y -= tileSz;
        if (this.output[id][i] === "D") y += tileSz;
        const tile = this.fences.getTileAtWorldXY(x, y);
        // console.log(x, y, tile, "here");
        if (tile !== null) return false;
      }
      return true;
    };
    if (this.checkInput(this.output[id])) {
      if (!canMove(id)) {
        this.output[id] = "***";
        if (id === 1) this.movementA += seperator + "*";
        else this.movementB += seperator + "*";
        return;
      }
      if (id === 1) this.movementA += seperator + this.output[id];
      else this.movementB += seperator + this.output[id];
      while (this.output[id].length < this.stringLength) {
        this.output[id] += "*";
      }
    } else {
      if (id === 1) this.movementA += seperator + "*";
      else this.movementB += seperator + "*";
      this.output[id] = "***";
    }
  }
  async update(_: number, dt: number) {
    // this.CompileCode();
    if (this.ok && !this.isPause) {
      this.textNoti.setText("Press SPACE\nto stop");
      this.ok = false;
      wait(updateDelay).then(() => (this.ok = true));
      if (this.step > this.totalStep) {
        // Out of step => Game over
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          const scorePlayer1 = this.scoreMap.getScore(1);
          const scorePlayer2 = this.scoreMap.getScore(2);
          let result = "draw";
          if (scorePlayer1 > scorePlayer2) {
            result = "Player 1";
          } else if (scorePlayer1 < scorePlayer2) {
            result = "Player 2";
          }
          this.scene.start("GameOver", { result, scorePlayer1, scorePlayer2 });
          this.scene.stop();
        });
        return;
      }
      const board = this.renderBoard();
      console.log("Input Player1");
      console.log(board[0]);
      console.log("Input Player2");
      console.log(board[1]);
      await this.RunCode();
      // console.log(this.output[1], this.output[2]);
      if (this.step === 0) {
        this.getCoord(this.output[1], 1);
        this.getCoord(this.output[2], 2);
        console.log(this.output[1], this.output[2]);
        this.step++;
        return;
      }
      // this.renderBoard();
      this.textStepContent.setText(`${this.step}/${this.totalStep}`);
      this.processInput(1);
      this.processInput(2);

      console.log(this.output[1], this.output[2]);
      // Implement K-moves (preprocessed input)
      this.updateKmove(dt, 0);
      await wait(moveDelay);
      this.updateKmove(dt, 1);
      await wait(moveDelay);
      this.updateKmove(dt, 2);
      await wait(moveDelay);
      // this.fixFalseCoord();
      this.step++;
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (
      spaceJustPressed &&
      localStorage.getItem("binaryCodeA") !== null &&
      localStorage.getItem("binaryCodeB") !== null
    ) {
      this.isPause = !this.isPause;
      this.textNoti.setText("Press SPACE\nto start");
    }
  }
  getInputFromUser() {
    this.userInput = arr[Math.floor(5 * Math.random())];
  }
  renderBorder(layer: Phaser.Tilemaps.TilemapLayer) {
    const debugGraphics = this.add.graphics().setAlpha(0.5);
    debugGraphics.lineStyle(2, 0xffffff, 0.25);
    layer.forEachTile(tile => {
      if (tile.index !== -1) {
        const x = tile.getLeft();
        const y = tile.getTop();
        const width = tile.width;
        const height = tile.height;
        debugGraphics.strokeRect(x, y, width, height);
      }
    });
  }
  renderBoard() {
    // get current state
    const currentState = this.scoreMap.getMapState();
    const scoreMap = this.scoreMap.getScoreMap();

    for (let i = 0; i < 20; i++) {
      this.state[i] = [];
      for (let j = 0; j < 20; j++) this.state[i][j] = currentState[j][i];
    }
    this.map.getLayer("fence")?.data.forEach((row, i) => {
      row.forEach((tile, j) => {
        if (tile.index !== -1) this.state[i][j] = -1;
      });
    });

    this.inputForA = this.inputForB = "2\n";
    if (this.step === 0) {
      this.inputForA = this.inputForB = "1\n";
    }
    let startPoint = this.scoreMap.getStartPoint();
    let endPoint = this.scoreMap.getEndPoint();
    // get point
    this.renderMapScoreAndState(startPoint, endPoint, scoreMap);
    // console.log("after render", this.inputForA);
    // get position of player 1 and player 2
    let blockSize = this.scoreMap.getBlockSize();

    // this.inputForB = this.inputForA;
    if (this.step !== 0) {
      this.inputForA = this.renderPostition(
        blockSize,
        startPoint,
        this.inputForA,
        this.player1,
        this.player2,
        this.beginPosition1,
        this.beginPosition2,
        1
      );
      this.inputForB = this.renderPostition(
        blockSize,
        startPoint,
        this.inputForB,
        this.player2,
        this.player1,
        this.beginPosition2,
        this.beginPosition1,
        2
      );
    }

    // console.log("before", this.inputForA);

    if (this.step === 0) {
      startCoords.forEach(
        coord => (this.inputForA += `${coord[0]} ${coord[1]} `)
      );
      this.inputForA += this.totalStep.toString();

      startCoords.forEach(
        coord => (this.inputForB += `${coord[0]} ${coord[1]} `)
      );
      this.inputForB += this.totalStep.toString();
    }
    // history of movement
    if (this.step !== 0) {
      const historyA = this.movementA.split(seperator);
      const historyB = this.movementB.split(seperator);
      for (let i = 1; i < this.step; i++) {
        this.inputForA += historyA[i] + " " + historyB[i] + "\n";
        this.inputForB += historyB[i] + " " + historyA[i] + "\n";
      }
      // this.inputForB += this.movementB;
      // this.inputForB += "\n";
      // this.inputForB += this.movementA;

      // this.inputForA += this.movementA;
      // this.inputForA += "\n";
      // this.inputForA += this.movementB;
    }

    // console.log(this.inputForA);
    return [this.inputForA, this.inputForB];
  }
  async RunCode() {
    const getOutput = async (
      binary: string,
      id: number,
      input: string,
      typeLanguage: string
    ) => {
      const response = await axios.post(`${EXECUTOR_URL}/run_code`, {
        code: binary,
        stdin: input,
        language: typeLanguage,
      });
      // console.log(input, "here");
      this.output[id] = response.data.stdout;
      // console.log(this.step, " ", id, " data");
    };
    await getOutput(
      localStorage.getItem("binaryCodeA")!,
      1,
      this.inputForA,
      localStorage.getItem("languageA")!
    );
    await getOutput(
      localStorage.getItem("binaryCodeB")!,
      2,
      this.inputForB,
      localStorage.getItem("languageB")!
    );
  }
  updateKmove(dt: number, k: number) {
    // console.log("Player 1 output ", this.output[1]);
    this.inputComponent.importInput(this.output[1][k]);
    this.inputBomb.importInput(this.output[1][k], this.output[2][k]);
    this.inputComponent2.importInput(this.output[2][k]);
    this.inputBomb2.importInput(this.output[2][k], this.output[1][k]);
    this.components.update(dt);
    this.textP1.setText(
      `\nScore:${this.scoreMap.getScore(1)} \nMove:${this.output[1]?.charAt(k) ?? ""}`
    );
    this.textP2.setText(
      `\nScore:${this.scoreMap.getScore(2)}\nMove:${this.output[2]?.charAt(k) ?? ""}`
    );
    console.log("Done move");
  }
  getCoord(coordStr: string, id: number) {
    const coord = coordStr.trimEnd().split(" ");
    // console.log(coord);
    let startX = Number(coord[1]);
    let startY = Number(coord[0]);
    const isValid = startCoords.some(crd => {
      return startX === crd[1] && startY === crd[0];
    });
    if (!isValid) {
      startX = startCoords[0][1];
      startY = startCoords[0][0];
    }
    if (id === 1) {
      this.player1.x = this.tileToPixel(startX);
      this.player1.y = this.tileToPixel(startY);
      this.beginPosition1 = [startY, startX];
    }
    if (id == 2) {
      this.player2.x = this.tileToPixel(startX);
      this.player2.y = this.tileToPixel(startY);
      this.beginPosition2 = [startY, startX];
    }
  }
  tileToPixel(idx: number) {
    return tileSz + idx * tileSz - tileSz / 2;
  }
  renderMapScoreAndState(
    startPoint: [number, number],
    endPoint: [number, number],
    scoreMap: number[][]
  ) {
    for (let i = startPoint[0]; i <= endPoint[0]; i++) {
      for (let j = startPoint[1]; j <= endPoint[1]; j++) {
        if (this.state[i][j] === -1) {
          this.inputForA += "-1 ";
          this.inputForB += "-1 ";
        } else {
          this.inputForA += scoreMap[j][i].toString();
          this.inputForA += " ";
          this.inputForB += scoreMap[j][i].toString();
          this.inputForB += " ";
        }
      }
      this.inputForA += "\n";
      this.inputForB += "\n";
    }
    if (this.step !== 0) {
      for (let i = startPoint[0]; i <= endPoint[0]; i++) {
        for (let j = startPoint[1]; j <= endPoint[1]; j++) {
          if (this.state[i][j] === -1) {
            this.inputForA += "0 ";
            this.inputForB += "0 ";
            continue;
          }
          let flagValue = this.state[i][j].toString();
          this.inputForA += flagValue;
          this.inputForA += " ";
          if (flagValue === "1") flagValue = "2";
          else if (flagValue === "2") flagValue = "1";
          this.inputForB += flagValue;
          this.inputForB += " ";
        }
        this.inputForA += "\n";
        this.inputForB += "\n";
      }
    }
    // console.log("render map", this.inputForA);
  }
  fixFalseCoord() {
    this.player1.x = Math.round(this.player1.x);
    this.player1.y = Math.round(this.player1.y);
    this.player2.x = Math.round(this.player2.x);
    this.player2.y = Math.round(this.player2.y);
  }
  renderPostition(
    blockSize: number,
    startPoint: [number, number],
    input: string,
    player1: Phaser.Physics.Arcade.Sprite,
    player2: Phaser.Physics.Arcade.Sprite,
    beginPosition1: number[],
    beginPosition2: number[],
    id: number
  ) {
    let playerInput = input;
    playerInput +=
      `${(player1.y - blockSize / 2) / blockSize - startPoint[1] + 1} ` +
      `${(player1.x - blockSize / 2) / blockSize - startPoint[0] + 1} `;
    playerInput += this.scoreMap.getScore(id).toString() + " \n";
    playerInput +=
      `${(player2.y - blockSize / 2) / blockSize - startPoint[1] + 1} ` +
      `${(player2.x - blockSize / 2) / blockSize - startPoint[0] + 1} `;
    playerInput += this.scoreMap.getScore(3 - id).toString() + " \n";
    playerInput += `${beginPosition1[0]} ${beginPosition1[1]} `;
    playerInput += `${beginPosition2[0]} ${beginPosition2[1]} `;
    playerInput += `${this.step - 1} ${this.totalStep}`;
    playerInput += "\n";
    return playerInput;
  }
}
