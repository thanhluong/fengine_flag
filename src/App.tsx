import { useRef, useState, useCallback } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import CodeMirror from "@uiw/react-codemirror";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { cpp } from "@codemirror/lang-cpp";

const defaultCppCode = `#include <iostream>`;

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [cppCode, setCppCode] = useState<string>(defaultCppCode);
  const [Player, changePlayer] = useState<string>("Player 1");

  const onChangePlayer = () => {
    if (Player === "Player 1") changePlayer("Player 2");
    else changePlayer("Player 1");
  };

  const onCodeChange = useCallback((val: string, _: any) => {
    setCppCode(val);
  }, []);

  const submitCode = () => {
    if (Player === "Player 1") {
      localStorage.setItem("codeA", cppCode);
    } else localStorage.setItem("codeB", cppCode);
  };
  // const addSprite = () => {
  //   if (phaserRef.current) {
  //     const scene = phaserRef.current.scene;

  //     if (scene) {
  //       // Add a new sprite to the current scene at a random position
  //       const x = Phaser.Math.Between(64, scene.scale.width - 64);
  //       const y = Phaser.Math.Between(64, scene.scale.height - 64);

  //       //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
  //       // const star = scene.add.sprite(x, y, 'star');
  //     }
  //   }
  // };

  return (
    <div id="app">
      <button onClick={onChangePlayer}>{Player}</button>
      <div>
        <CodeMirror
          theme={tokyoNight}
          value={cppCode}
          height="400px"
          width="350px"
          extensions={[cpp()]}
          onChange={onCodeChange}
        />
      </div>
      <button onClick={submitCode}>submit</button>

      <PhaserGame ref={phaserRef} />
      {/* <div>
        <div>
          <button className="button" onClick={addSprite}>
            Add New Sprite
          </button>
        </div>
      </div> */}
    </div>
  );
}

export default App;
