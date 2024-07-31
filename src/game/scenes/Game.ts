import { Scene, Physics } from 'phaser';
import ComponentService from '../../service/ComponentService';
import KeyboardMovement from '../../components/KeyboardMovement';
import KeyboardAnimation from '../../components/KeyboardAnimation';
import Bomb from '../../gameobjects/Bomb';
import BombSpawn from '../../components/BombSpawn';
import InputComponent from '../../components/InputComponent';
import InputBomb from '../../components/InputBomb';
export interface WASDKeys {
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
}

const arr = ['L', 'R', 'U', 'D', 'X'];
const tileSz = 16;

export class Game extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  components: ComponentService;
  player1: Physics.Arcade.Sprite;
  player2: Physics.Arcade.Sprite;
  enemy: Physics.Arcade.Sprite;
  fences: Phaser.Tilemaps.TilemapLayer;
  grass: Phaser.Tilemaps.TilemapLayer;
  bombs: Physics.Arcade.StaticGroup;
  userInput: string = '';
  inputComponent: InputComponent;
  inputComponent2: InputComponent;
  inputBomb: InputBomb;
  inputBomb2: InputBomb;
  ok: boolean = true;
  constructor() {
    super('Game');
  }

  preload() {
    this.load.setPath('assets');
    this.load.tilemapTiledJSON('tilemap', 'Tilemap/tilemap.json');
    this.load.image('grass-ts', 'Tilemap/Grass.png');
    this.load.image('fences-ts', 'Tilemap/Fences.png');
    this.load.image('bomb', 'Character/bomb.png');
    this.load.spritesheet('cute1', 'Character/cute1.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    // const { width, height } = this.scale;
    // Create platform
    const map = this.make.tilemap({ key: 'tilemap' });
    const grassTileset = map.addTilesetImage('Grass', 'grass-ts');
    const fencesTileset = map.addTilesetImage('Fences', 'fences-ts');
    this.grass = map.createLayer('grass', grassTileset!)!;
    this.fences = map.createLayer('fence', fencesTileset!)!;
    this.renderBorder(this.grass);
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
    // this.bombs = this.physics.add.staticGroup({ classType: Bomb });

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
    this.inputBomb = new InputBomb(this.bombs, this.player2);
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
      new BombSpawn(this.cursors, this.bombs)
    );
    this.components.addComponent(
      this.player2,
      new KeyboardAnimation(this.cursors, 'cute1')
    );
    this.inputBomb2 = new InputBomb(this.bombs, this.player1);
    this.components.addComponent(this.player2, this.inputBomb2);
    this.inputComponent2 = new InputComponent(this.fences);
    this.components.addComponent(this.player2, this.inputComponent2);
    // EventBus.emit('current-scene-ready', this);
  }
  update(_: number, dt: number): void {
    if (this.ok) {
      this.ok = false;
      this.getInputFromUser();
      this.inputComponent.importInput(this.userInput);
      this.inputBomb.importInput(this.userInput);
      this.getInputFromUser();
      this.inputComponent2.importInput(this.userInput);
      this.inputBomb2.importInput(this.userInput);
      this.time.delayedCall(1000, () => {
        this.ok = true;
      });
    }
    this.components.update(dt);
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
}
