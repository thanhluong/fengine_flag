import { Game as MainGame } from './scenes/Game';
import { AUTO, Game, Types, Scale } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 16 * 42,
  height: 16 * 42,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [MainGame],
};

const StartGame = (parent: any) => {
  return new Game({ ...config, parent });
};

export default StartGame;
