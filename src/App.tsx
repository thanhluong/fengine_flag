import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";

import CodeMirror from "@uiw/react-codemirror";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { cpp } from "@codemirror/lang-cpp";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";
const defaultCppCode = `#include <iostream>`;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
const EXECUTOR_URL = import.meta.env.VITE_EXECUTOR_URL as string;

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [cppCode, setCppCode] = useState<string>(defaultCppCode);
  const [player, setPlayer] = useState<string>("Player 1");
  const [isPlayer1Ready, setPlayer1Ready] = useState<boolean>(false);
  const [isPlayer2Ready, setPlayer2Ready] = useState<boolean>(false);
  const [chosenLanguage, setChosenLanguage] = useState<string>("cpp");
  const [chosenK, setChosenK] = useState<string>("1");

  const onChangePlayer = () => {
    if (player === "Player 1") {
      setPlayer("Player 2");
      setCppCode(localStorage.getItem("codeB")!);
    } else {
      setPlayer("Player 1");
      setCppCode(localStorage.getItem("codeA")!);
    }
  };

  const onCodeChange = (val: string) => {
    setCppCode(val);
    if (player === "Player 1") {
      setPlayer1Ready(false);
    } else setPlayer2Ready(false);
  };

  const getBinaryCode = async (code: string, id: number) => {
    const response = await axios.post(`${EXECUTOR_URL}/compile_and_get_b64`, {
      code: code,
      language: chosenLanguage,
    });
    console.log(response.data.error);
    if (response.data.error !== "no") {
      alert(`Compilation error with code's player ${id}`);
    } else {
      if (id === 1) {
        localStorage.setItem("binaryCodeA", response.data.src_as_b64);
        setPlayer1Ready(true);
      } else {
        localStorage.setItem("binaryCodeB", response.data.src_as_b64);
        setPlayer2Ready(true);
      }
    }
  };

  const submitCode = () => {
    if (player === "Player 1") {
      localStorage.setItem("codeA", cppCode);
      localStorage.setItem("languageA", chosenLanguage);
      getBinaryCode(cppCode, 1);
    } else {
      localStorage.setItem("codeB", cppCode);
      localStorage.setItem("languageB", chosenLanguage);
      getBinaryCode(cppCode, 2);
    }
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

  let handleChosenLanguageChange = (event: SelectChangeEvent) => {
    setChosenLanguage(event.target.value as string);
  };

  let handleChosenKChange = (event: SelectChangeEvent) => {
    setChosenK(event.target.value as string);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div id="app">
        <div>
          <Stack direction="column" spacing={2}>
            <Select value={chosenK} onChange={handleChosenKChange}>
              <MenuItem value={"1"}>K=1</MenuItem>
              <MenuItem value={"2"}>K=2</MenuItem>
              <MenuItem value={"3"}>K=3</MenuItem>
            </Select>
            <Stack direction="row" spacing={1}>
              <Button
                color="secondary"
                variant="contained"
                onClick={onChangePlayer}
              >
                {player}
              </Button>
              <Select
                value={chosenLanguage}
                onChange={handleChosenLanguageChange}
              >
                <MenuItem value={"cpp"}>C++ 17</MenuItem>
                <MenuItem value={"py"}>Python 3</MenuItem>
              </Select>
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
