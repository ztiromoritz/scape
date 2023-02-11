import { GameSpec, initGame } from "./components/engine";
import { Vect, _v } from "garfunkel";
import { btnp } from "./components/keyboard_handler";
import { createSound, sounds } from "./components/sounds";

import { Howl, Howler } from "howler";
import { createSpeechHandler } from "./components/speak";
import { getRandomInt } from "./components/utils";

const speechHandler = createSpeechHandler();

const output = document.getElementById("test-output");
const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

type Tree = {
  length: number;
  row: number;
  pos: Vect;
  speed: number;
  sound: Howl | null;
  playing: boolean;
};
const spec: GameSpec = (() => {
  const tileSize = 32;
  const rows = 10;
  const cols = 20;
  const width = tileSize * cols;
  const height = tileSize * rows;
  const treeDensity = 1;
  const cam = _v(0, 0);
  let player_x_offset = (tileSize * cols) / 2;
  let frame: number;
  let player = _v(player_x_offset, height - tileSize);
  let attached_tree: Tree | null = null;

  const draw = true;

  let trees: Tree[] = [];

  function initCanvas() {
    canvas.width = width;
    canvas.height = height;
  }
  function initTrees() {
    const from = 1;
    const to = rows - 2;
    trees = [];
    for (let row = from; row <= to; row++) {
      let x = 0;
      while (x < width) {
        const length = getRandomInt(1, 4) + getRandomInt(1, 4);
        const is_gap = Math.random() > treeDensity;
        x = x + length * tileSize;

        if (!is_gap) {
          const tree = {
            length,
            row,
            speed: (row + 1) % 2 ? 3 + getRandomInt(0, 2) : -getRandomInt(0, 1),
            pos: _v(x, row * tileSize),
            sound: (row + 1) % 2 ? createSound("banjo") : createSound("fiddle"),
            playing: false,
          };
          tree.sound?.loop(true);
          tree.sound?.pos(tree.pos.x / 100, tree.pos.y / 100);
          setTimeout(() => tree.sound?.play(), Math.random() * 1200);
          trees.push(tree);
          break; // just one tree
        }
      }
    }
  }

  function updateTrees() {
    trees.forEach((tree) => {
      tree.pos.add(_v(-1, 0).mul(tree.speed));
      if (tree.row - player.y / tileSize === -1) {
        tree.sound?.volume(0.3);
        tree.playing = true;
      } else {
        tree.sound?.volume(0.0);
        tree.playing = false;
      }

      tree.sound?.pos(
        (tree.pos.x + (tree.length * tileSize) / 2) / 100,
        tree.pos.y / 100
      );
      const rel_pos = tree.pos.clone().sub(cam);
      //reset
      if (rel_pos.x < -tree.length * tileSize) {
        // leave cam to the left => is relatively faster
        tree.pos.add(_v(width + tree.length * tileSize));
      }
      if (rel_pos.x > width + tree.length * tileSize) {
        // leave cam to the right => is relatively slower
        tree.pos.sub(_v(width + 2 * tree.length * tileSize));
      }
    });
  }

  function renderTrees() {
    trees.forEach((tree) => {
      if (ctx) {
        if (tree.playing) {
          ctx.fillStyle = tree.speed <= 0 ? "green" : "rgb(139,69,19)";
        } else {
          ctx.fillStyle = tree.speed <= 0 ? "lightgreen" : "rgb(222,184,135)";
        }
        const rel_pos = tree.pos.clone().sub(cam);
        ctx.fillRect(
          rel_pos.x + 1,
          rel_pos.y + 1,
          tileSize * tree.length - 2,
          tileSize - 2
        );
      }
    });
  }

  function updateCam() {
    cam.x = player.x - player_x_offset;
    //cam.set(player.x - player_x_offset, 0);
  }

  function frogHitsTree(): Tree | null {
    let result: Tree | null = null;
    trees.forEach((tree) => {
      const player_row = player.y / tileSize;
      if (tree.row === player_row) {
        const left = tree.pos.x - tileSize / 2;
        const right = tree.pos.x + tree.length * tileSize - tileSize / 2;
        if (left < player.x && player.x < right) {
          result = tree;
        }
      }
    });
    return result;
  }

  function updatePlayer() {
    let moved = false;
    if (btnp("w") || btnp("ArrowUp")) {
      sounds["jump"].play();
      player.add(_v(0, -1).mul(tileSize));
      moved = true;
    }

    if (btnp("s") || btnp("ArrowDown")) {
      sounds["jump"].play();
      player.add(_v(0, 1).mul(tileSize));
      moved = true;
    }

    if (moved) {
      attached_tree = null;

      const tree = frogHitsTree();
      if (tree) {
        attached_tree = tree;
      } else {
        if (player.y === 0) {
          speechHandler.speak("success ");
          game.stop();
          Howler.stop();
          setTimeout(() => (window.location.href = window.location.href), 3000);
        } else {
          sounds["explosion"].play();
          game.stop();
          Howler.stop();
          speechHandler.speak("game over");
          setTimeout(() => (window.location.href = window.location.href), 3000);
        }
        // todo play splash and restart
      }
    }

    if (attached_tree) {
      player.add(_v(-attached_tree.speed, 0));
    }

    Howler.pos(player.x / 100, player.y / 100);
  }

  initCanvas();
  return {
    _init() {
      frame = 1;
      initTrees();
    },
    _update() {
      frame++;
      updatePlayer();
      updateTrees();
      updateCam();
    },
    _render() {
      if (output) {
        output.innerText = `cam ${cam.x} ${cam.y} player ${player.x}, ${
          player.y
        } Pool:  ${_v.pool.in_use_count()}/${_v.pool.free_count()} ${frame}`;
      }
      if (draw && ctx) {
        ctx.clearRect(0, 0, width, height);
        renderTrees();

        // strand
        for (let n = -cam.x; n < -cam.x + width; n++) {
          if (Math.floor(n + cam.x) % tileSize === 0) {
            ctx.fillStyle = "rgb(200, 200, 200)";
            ctx.fillRect(
              (n % tileSize) + cam.x + n,
              height - 1 * tileSize,
              tileSize / 2,
              tileSize
            );

            ctx.fillRect((n % tileSize) + cam.x + n, 0, tileSize / 2, tileSize);
          }
        }
        ctx.fillStyle = "rgb(200, 0, 0)";

        const relPlayer = _v(player.x - cam.x, player.y - cam.y);
        ctx.fillRect(relPlayer.x, relPlayer.y, tileSize, tileSize);
      }
    },
  };
})();

const game = initGame(spec);

const testButton = document.getElementById("test");
testButton?.addEventListener("click", () => {
  //sounds["sonar-ping"].play();

  //sounds["banjo"].play();
  const sound = createSound("banjo");
  sound?.play();
});

const startButton = document.getElementById("start");
startButton?.addEventListener("click", () => {
  game.start();
  speechHandler.speak("welcome to frogger");
});

const resumeButton = document.getElementById("resume");
resumeButton?.addEventListener("click", () => {
  game.resume();
});
const stopButton = document.getElementById("stop");
stopButton?.addEventListener("click", () => {
  game.stop();
  Howler.stop();
});
