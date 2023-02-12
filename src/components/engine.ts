import { _v } from "garfunkel";

export type GameSpec = {
  _init?: () => void;
  _update?: () => void;
  _render?: () => void;
  options?: {
    fps?: number;
  };
};

export type Game = {
  start: () => void;
  stop: () => void;
  resume: () => void;
  readonly state: {
    running: boolean;
  };
};

export function initGame(spec: GameSpec): Game {
  const { _init, _update, _render, options } = spec || {};
  const { fps = 30 } = options || {};

  const interval = 1000 / fps;
  let start_timestamp: DOMHighResTimeStamp;
  function gameLoop(timestamp: DOMHighResTimeStamp) {
    start_timestamp = start_timestamp ?? timestamp;

    const delta = timestamp - start_timestamp;
    if (delta > interval) {
      start_timestamp = timestamp - (delta % interval);
      _v(() => _update?.());
      _v(() => _render?.());
    }

    if (state.running) {
      window.requestAnimationFrame(gameLoop);
    }
  }

  function start() {
    state.running = true;
    _init?.();
    window.requestAnimationFrame(gameLoop);
  }

  function resume() {
    state.running = true;
    window.requestAnimationFrame(gameLoop);
  }

  function stop() {
    state.running = false;
  }

  const state = {
    running: false,
  };

  return { start, resume, stop, state };
}
