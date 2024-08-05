import { useRef, useState, useCallback } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";

import CodeMirror from "@uiw/react-codemirror";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { cpp } from "@codemirror/lang-cpp";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const defaultCppCode = `#include <iostream>`;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [cppCode, setCppCode] = useState<string>(defaultCppCode);
  const [Player, changePlayer] = useState<string>("Player 1");
  const [isPlayer1Ready, setPlayer1Ready] = useState<boolean>(false);
  const [isPlayer2Ready, setPlayer2Ready] = useState<boolean>(false);

  const onChangePlayer = () => {
    if (Player === "Player 1") {
      changePlayer("Player 2");
      setCppCode(localStorage.getItem("codeB")!);
    } else {
      changePlayer("Player 1");
      setCppCode(localStorage.getItem("codeA")!);
    }
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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div id="app">
        <div>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2}>
              <Button
                color="secondary"
                variant="contained"
                onClick={onChangePlayer}
              >
                {Player}
              </Button>
              <Button variant="contained" onClick={submitCode}>
                submit
              </Button>
            </Stack>
            <CodeMirror
              theme={tokyoNight}
              value={cppCode}
              height="400px"
              width="350px"
              extensions={[cpp()]}
              onChange={onCodeChange}
            />
            <FormGroup>
              <FormControlLabel
                control={<Checkbox color="success" checked={isPlayer1Ready} />}
                label={"Player 1 ready"}
              />
              <FormControlLabel
                control={<Checkbox color="success" checked={isPlayer2Ready} />}
                label={"Player 2 ready"}
              />
            </FormGroup>
          </Stack>
        </div>

        <PhaserGame ref={phaserRef} />
        {/* <div>
        <div>
          <button className="button" onClick={addSprite}>
            Add New Sprite
          </button>
        </div>
      </div> */}
      </div>
    </ThemeProvider>
  );
}

export default App;
