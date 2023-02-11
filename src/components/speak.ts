const synth = window.speechSynthesis;
export function createSpeechHandler() {
  let pitch = 1;
  let rate = 1;
  let voice = 11;
  let voices: SpeechSynthesisVoice[] = [];

  let resolver: any;
  const ready = new Promise((resolve) => (resolver = resolve));

  speechSynthesis.onvoiceschanged = () => {
    voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase();
      const bname = b.name.toUpperCase();

      if (aname < bname) {
        return -1;
      } else if (aname == bname) {
        return 0;
      } else {
        return +1;
      }
    });
    resolver?.();
  };

  async function speak(text: string) {
    await ready;
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    utterThis.voice = voices[voice];
    synth.speak(utterThis);
  }

  return { speak };
}
