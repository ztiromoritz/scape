import { Howl } from "howler";

export const sounds: Record<string, Howl> = {};
export const modules: Record<string, unknown> = {};
const allMp3 = import.meta.glob(["../sounds/*.mp3", "../sounds/*.wav"], {
  eager: true,
});

Object.entries(allMp3).forEach(([name, mod]) => {
  console.log(name, mod);
  const sound_name = name.split("/").at(-1)?.split(".")[0];
  if (sound_name) {
    sounds[sound_name] = new Howl({
      src: [(mod as any).default],
    });

    modules[sound_name] = mod;
  }
});

export function createSound(name: string) {
  const mod = modules[name];
  if (mod) {
    return new Howl({
      src: [(mod as any).default],
    });
  }
  return null;
}
