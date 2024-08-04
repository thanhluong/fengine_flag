import { useRef, useState, useCallback } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';

import CodeMirror from '@uiw/react-codemirror';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { cpp } from '@codemirror/lang-cpp';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const defaultCppCode = `#include <iostream>`;

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [cppCode, setCppCode] = useState<string>(defaultCppCode);
  const [player, changePlayer] = useState<string>('Player 1');
  localStorage.setItem('codeA', '');
  localStorage.setItem('codeB', '');
  localStorage.setItem('binaryCodeA', '');
  localStorage.setItem('binaryCodeB', '');

  const onChangePlayer = () => {
    if (player === 'Player 1') {
      changePlayer('Player 2');
      setCppCode(localStorage.getItem('codeB')!);
    } else {
      changePlayer('Player 1');
      setCppCode(localStorage.getItem('codeA')!);
    }
  };

  const onCodeChange = useCallback((val: string, _: any) => {
    setCppCode(val);
  }, []);

  const submitCode = () => {
    if (player === 'Player 1') {
      localStorage.setItem('codeA', cppCode);
    } else localStorage.setItem('codeB', cppCode);
  };

  return (
    <div id="app">
      <div>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button
              color="secondary"
              variant="contained"
              onClick={onChangePlayer}
            >
              {player}
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
  );
}

export default App;
