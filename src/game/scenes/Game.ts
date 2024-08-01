import { Scene, Physics } from 'phaser';
import ComponentService from '../../service/ComponentService';
import KeyboardMovement from '../../components/KeyboardMovement';
import KeyboardAnimation from '../../components/KeyboardAnimation';
import Bomb from '../../gameobjects/Bomb';
import BombSpawn from '../../components/BombSpawn';
import InputComponent from '../../components/InputComponent';
import InputBomb from '../../components/InputBomb';
import ScoreMap from '../../components/ScoreMap.ts';
import axios from 'axios';

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
const codeA =
  "#include<bits/stdc++.h>\nusing namespace std;typedef pair<int,int>ii;mt19937 rd(chrono::steady_clock::now().time_since_epoch().count());int rand(int l,int r){return l+rd()%(r-l+1);};int main(){ios_base::sync_with_stdio(0);cin.tie(0);int x=rand(1,5);if(x==1)cout<<'L';else if(x==2)cout<<'R';else if(x==3)cout<<'U';else if(x==4)cout<<'D';else cout<<'X';}";
const codeB =
  "#include<bits/stdc++.h>\nusing namespace std;typedef pair<int,int>ii;mt19937 rd(chrono::steady_clock::now().time_since_epoch().count());int rand(int l,int r){return l+rd()%(r-l+1);};int main(){ios_base::sync_with_stdio(0);cin.tie(0);int x=rand(1,5);if(x==1)cout<<'U';else if(x==2)cout<<'U';else if(x==3)cout<<'U';else if(x==4)cout<<'U';else cout<<'X';}";

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
  textP1: Phaser.GameObjects.Text;
  textP2: Phaser.GameObjects.Text;
  ok: boolean = true;
  output: string[] = [];
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
  }

  create() {
    // const { width, height } = this.scale;
    // Create platform
    this.CompileCode();
    const map = this.make.tilemap({ key: 'tilemap' });
    const grassTileset = map.addTilesetImage('Grass', 'grass-ts');
    const fencesTileset = map.addTilesetImage('Fences', 'fences-ts');
    this.grass = map.createLayer('grass', grassTileset!)!;
    this.fences = map.createLayer('fence', fencesTileset!)!;
    this.scoreMap = new ScoreMap();
    this.scoreMap.create();
    this.scoreMap.createMap(this);
    this.renderBorder(this.grass);

    // Add player info text
    this.textP1 = this.add.text(300, 20, 'PLAYER 1\nScore:\nMove:', {
      color: '#000',
      fontSize: 12,
    });

    this.textP2 = this.add.text(300, 80, 'PLAYER 2\nScore:\nMove:', {
      color: '#000',
      fontSize: 12,
    });
    // Create sprite
    // PLAYER 1
    this.player1 = this.physics.add.sprite(
      tileSz * 1 + tileSz * 0.5,
      tileSz * 16 + tileSz * 0.5,
      'cute1'
    );
    this.player1
      .setBodySize(this.player1.width / 3, this.player1.height / 3)
      .setDepth(10);
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.bombs = this.physics.add.staticGroup({ classType: Bomb });
    // PLAYER 2
    this.player2 = this.physics.add.sprite(
      tileSz * 16 + tileSz * 0.5,
      tileSz * 16 + tileSz * 0.5,
      'cute1'
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
    this.components.addComponent(
      this.player1,
      new BombSpawn(this.cursors, this.bombs)
    );
    this.components.addComponent(
      this.player1,
      new KeyboardAnimation(this.cursors, 'cute1')
    );
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
    this.components.addComponent(
      this.player2,
      new BombSpawn(this.cursors, this.bombs2)
    );
    this.components.addComponent(
      this.player2,
      new KeyboardAnimation(this.cursors, 'cute1')
    );
    this.inputBomb2 = new InputBomb(
      this.bombs2,
      this.player1,
      'flag-blue',
      this.scoreMap
    );
    this.components.addComponent(this.player2, this.inputBomb2);
    this.inputComponent2 = new InputComponent(this.fences);
    this.components.addComponent(this.player2, this.inputComponent2);
    // EventBus.emit('current-scene-ready', this);
  }
  update(_: number, dt: number): void {
    if (this.ok) {
      this.ok = false;
      // this.getInputFromUser();
      this.RunCode();
      this.inputComponent.importInput(this.output[1]);
      this.inputBomb.importInput(this.output[1]);
      this.getInputFromUser();
      this.inputComponent2.importInput(this.output[2]);
      this.inputBomb2.importInput(this.output[2]);
      this.time.delayedCall(1000, () => {
        this.ok = true;
      });
      this.components.update(dt);
      this.textP1.setText(
        `PLAYER 1\nScore:${this.scoreMap.getScore(2)} \nMove:${this.output[1]?.charAt(0) ?? ''}`
      );
      this.textP2.setText(
        `PLAYER 2\nScore:${this.scoreMap.getScore(2)}\nMove:${this.output[2]?.charAt(0) ?? ''}`
      );
      // console.log(this.scoreMap.getMap());
      // console.log('Score player 2', this.scoreMap.getScore(2));
    }
  }
  getInputFromUser() {
    this.userInput = arr[Math.floor(5 * Math.random())];
    // this.userInput = 'X';
  }
  renderBorder(layer: Phaser.Tilemaps.TilemapLayer) {
    const debugGraphics = this.add.graphics().setAlpha(0.5);
    debugGraphics.lineStyle(2, 0xff0000, 0.25);
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
  async CompileCode() {
    const getBinary = async (code: string, name: string) => {
      const response = await axios.post(`${EXECUTOR_URL}/compile_and_get_b64`, {
        code: code,
        language: 'cpp',
      });
      localStorage.setItem(name, response.data.src_as_b64);
      // console.log(response.data.src_as_b64);
    };
    await getBinary(codeA, 'binaryCodeA');
    await getBinary(codeB, 'binaryCodeB');
  }
  async RunCode() {
    const getOutput = async (binary: string, id: number) => {
      const response = await axios.post(`${EXECUTOR_URL}/run_code`, {
        code: binary,
        stdin: '',
      });
      this.output[id] = response.data.stdout;
      //console.log(this.output[id], id, "DAYNE");
    };
    await getOutput(localStorage.getItem('binaryCodeA')!, 1);
    await getOutput(localStorage.getItem('binaryCodeB')!, 2);
  }
}
