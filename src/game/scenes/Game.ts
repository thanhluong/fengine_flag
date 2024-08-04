import { Scene, Physics } from 'phaser';
import ComponentService from '../../service/ComponentService';
import KeyboardMovement from '../../components/KeyboardMovement';
import KeyboardAnimation from '../../components/KeyboardAnimation';
import Bomb from '../../gameobjects/Bomb';
import InputComponent from '../../components/InputComponent';
import InputBomb from '../../components/InputBomb';
import ScoreMap from '../../components/ScoreMap.ts';
import axios from 'axios';
// import {c} from "vite/dist/node/types.d-aGj9QkWt";

export interface WASDKeys {
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
}

const EXECUTOR_URL = import.meta.env.VITE_EXECUTOR_URL as string;

const arr = ['L', 'R', 'U', 'D', 'X'];
const tileSz = 16;
let codeA: string = '';
let codeB: string = '';
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
  userInput: string = '';
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
  movementA: string;
  movementB: string;

  constructor() {
    super('Game');
  }

  preload() {
    this.load.setPath('assets');
    this.load.tilemapTiledJSON('tilemap', 'Tilemap/tilemap.json');
    this.load.image('grass-ts', 'Tilemap/Grass.png');
    this.load.image('fences-ts', 'Tilemap/Fences.png');
    this.load.image('bomb', 'Character/bomb.png');
    this.load.image('flag-blue', 'Character/flag-blue.png');
    this.load.spritesheet('cute1', 'Character/cute1.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('cute2', 'Character/cute2.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    // const { width, height } = this.scale;
    // Create platform
    this.state = [];
    this.movementB = '';
    this.movementA = '';
    this.map = this.make.tilemap({ key: 'tilemap' });
    const grassTileset = this.map.addTilesetImage('Grass', 'grass-ts');
    const fencesTileset = this.map.addTilesetImage('Fences', 'fences-ts');
    this.grass = this.map.createLayer('grass', grassTileset!)!;
    this.scoreMap = new ScoreMap();
    this.scoreMap.create();
    this.scoreMap.createMap(this);
    this.fences = this.map.createLayer('fence', fencesTileset!)!;
    this.renderBorder(this.grass);

    // Add player info text
    this.textStepHeader = this.add.text(310, 30, 'Step', {
      color: '#000',
      fontStyle: '900',
      fontSize: '18px',
    });
    this.textStepContent = this.add.text(310, 50, '', {
      color: '#000',
      // fontStyle: '900',
      fontSize: 18,
    });
    this.textStepContent.setText(`${this.step}/30`);
    this.textP1Header = this.add.text(310, 80, 'PLAYER', {
      color: '#000',
      fontStyle: '900',
      fontSize: 12,
    });
    this.add.image(340, 85, 'cute1').setOrigin(0, 0.5);
    this.textP1 = this.add.text(310, 80, '\nScore:0\nMove:', {
      color: '#000',
      fontSize: 12,
    });
    this.textP2Header = this.add.text(310, 140, 'PLAYER', {
      color: '#000',
      fontStyle: '900',
      fontSize: 12,
    });
    this.add.image(340, 145, 'cute2').setOrigin(0, 0.5);
    this.textP2 = this.add.text(310, 140, '\nScore:0\nMove:', {
      color: '#000',
      fontSize: 12,
    });
    this.textNoti = this.add.text(300, 240, 'Press SPACE\nto start', {
      color: '#000',
      fontSize: 12,
      align: 'center',
    });
    // Create sprite
    // PLAYER 1
    this.player1 = this.physics.add.sprite(
      tileSz * 4 + tileSz * 0.5,
      tileSz * 13 + tileSz * 0.5,
      'cute1'
    );
    this.player1
      .setBodySize(this.player1.width / 3, this.player1.height / 3)
      .setDepth(10);
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.bombs = this.physics.add.staticGroup({ classType: Bomb });
    // PLAYER 2
    this.player2 = this.physics.add.sprite(
      tileSz * 13 + tileSz * 0.5,
      tileSz * 13 + tileSz * 0.5,
      'cute2'
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
    this.components.addComponent(
      this.player1,
      new KeyboardMovement(this.cursors)
    );
    this.components.addComponent(
      this.player1,
      new KeyboardMovement(this.cursors)
    );
    this.components.addComponent(this.player1, new KeyboardAnimation('cute1'));
    this.inputBomb = new InputBomb(
      this.bombs,
      this.player2,
      'bomb',
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
    this.components.addComponent(this.player2, new KeyboardAnimation('cute2'));
    this.inputBomb2 = new InputBomb(
      this.bombs2,
      this.player1,
      'flag-blue',
      this.scoreMap
    );
    this.components.addComponent(this.player2, this.inputBomb2);
    this.inputComponent2 = new InputComponent(this.fences);
    this.components.addComponent(this.player2, this.inputComponent2);
  }
  update(_: number, dt: number): void {
    this.CompileCode();
    if (this.ok && !this.isPause) {
      this.textNoti.setText('Press SPACE\nto stop');
      this.ok = false;
      if (this.step > 30) {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          const scorePlayer1 = this.scoreMap.getScore(1);
          const scorePlayer2 = this.scoreMap.getScore(2);
          let result = 'draw';
          if (scorePlayer1 > scorePlayer2) {
            result = 'Player 1';
          } else if (scorePlayer1 < scorePlayer2) {
            result = 'Player 2';
          }
          this.scene.start('GameOver', { result });
          this.scene.stop();
        });
        return;
      }
      this.RunCode();
      if (this.output[1] !== undefined) {
        this.inputComponent.importInput(this.output[1][0]);
        this.inputBomb.importInput(this.output[1][0]);
        this.movementA += this.output[1][0];
      }
      if (this.output[2] !== undefined) {
        this.inputComponent2.importInput(this.output[2][0]);
        this.inputBomb2.importInput(this.output[2][0]);
        this.movementB += this.output[2][0];
      }

      this.time.delayedCall(1000, () => {
        this.ok = true;
      });
      this.components.update(dt);
      this.textStepContent.setText(`${this.step++}/30`);
      this.textP1.setText(
        `\nScore:${this.scoreMap.getScore(1)} \nMove:${this.output[1]?.charAt(0) ?? ''}`
      );
      this.textP2.setText(
        `\nScore:${this.scoreMap.getScore(2)}\nMove:${this.output[2]?.charAt(0) ?? ''}`
      );
      this.renderBoard();
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (
      spaceJustPressed &&
      localStorage.getItem('binaryCodeA') !== null &&
      localStorage.getItem('binaryCodeB') !== null
    ) {
      this.isPause = !this.isPause;
      this.textNoti.setText('Press SPACE\nto start');
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
    for (let i = 0; i < 20; i++) {
      this.state[i] = [];
      for (let j = 0; j < 20; j++) this.state[i][j] = currentState[j][i];
    }
    this.map.getLayer('fence')?.data.forEach((row, i) => {
      row.forEach((tile, j) => {
        if (tile.index !== -1) this.state[i][j] = -1;
      });
    });
    this.inputForA = this.inputForB = '';
    for (let i = 1; i <= 16; i++) {
      for (let j = 1; j <= 16; j++) {
        this.inputForA += this.state[i][j].toString();
        this.inputForA += ' ';
      }
      this.inputForA += '\n';
    }
    // get position of player 1 and player 2
    this.inputForB = this.inputForA;
    this.inputForA +=
      `${(this.player1.y - 8) / 16} ` + `${(this.player1.x - 8) / 16}\n`;
    this.inputForA +=
      `${(this.player2.y - 8) / 16} ` + `${(this.player2.x - 8) / 16}\n`;

    this.inputForB +=
      `${(this.player2.y - 8) / 16} ` + `${(this.player2.x - 8) / 16}\n`;
    this.inputForB +=
      `${(this.player1.y - 8) / 16} ` + `${(this.player1.x - 8) / 16}\n`;
    // history of movement
    this.inputForB += this.movementB;
    this.inputForB += '\n';
    this.inputForB += this.movementA;

    this.inputForA += this.movementA;
    this.inputForA += '\n';
    this.inputForA += this.movementB;
    console.log(this.inputForA);
  }
  async CompileCode() {
    const getBinary = async (code: string, name: string) => {
      const response = await axios.post(`${EXECUTOR_URL}/compile_and_get_b64`, {
        code: code,
        language: 'cpp',
      });
      console.log(response.data.error, 'rere');

      if (response.data.error !== 'no') {
        if (name === 'binaryCodeA') {
          alert('Error in Player1 Code');
        } else alert('Error in Player2 Code');
      } else localStorage.setItem(name, response.data.src_as_b64);
      // console.log(response.data.src_as_b64);
    };
    if (
      localStorage.getItem('codeA') !== '' &&
      localStorage.getItem('codeA') !== null &&
      codeA !== localStorage.getItem('codeA')
    ) {
      codeA = localStorage.getItem('codeA')!;
      console.log('TRITRI1');
      await getBinary(codeA, 'binaryCodeA');
    }

    if (
      localStorage.getItem('codeB') != '' &&
      localStorage.getItem('codeB') != null &&
      codeB !== localStorage.getItem('codeB')
    ) {
      console.log('TRITRI2');

      codeB = localStorage.getItem('codeB')!;
      await getBinary(codeB, 'binaryCodeB');
    }
  }
  async RunCode() {
    const getOutput = async (binary: string, id: number) => {
      const response = await axios.post(`${EXECUTOR_URL}/run_code`, {
        code: binary,
        stdin: '',
      });
      // console.log(response.data.stdout, "@@@@");
      this.output[id] = response.data.stdout;
    };
    await getOutput(localStorage.getItem('binaryCodeA')!, 1);
    await getOutput(localStorage.getItem('binaryCodeB')!, 2);
  }
}
