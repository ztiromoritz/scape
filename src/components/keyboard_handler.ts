function createKeyboardHandler() {
  window.addEventListener("blur", () => {
    keys.clear();
  });

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
    pressed.delete(e.key);
  });

  const keys = new Set<string>();
  const pressed = new Set<string>();

  return {
    is_key_down(key: string) {
      return keys.has(key);
    },
    press(key: string): boolean {
      const done = keys.has(key) && !pressed.has(key);
      if (done) pressed.add(key);
      return done;
    },
  };
}

const keyboardHandler = createKeyboardHandler();

export function btn(key: string) {
  return keyboardHandler.is_key_down(key);
}

export function btnp(key: string): boolean {
  return keyboardHandler.press(key);
}
