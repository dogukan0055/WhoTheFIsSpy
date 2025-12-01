export const playSound = (
  type: "click" | "success" | "error" | "reveal" | "alarm"
) => {
  const settings = JSON.parse(
    localStorage.getItem("spy-settings") || '{"sound": true}'
  );
  if (!settings.sound) return;

  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case "success":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "error":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case "reveal":
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case "alarm":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

let bgAudio: HTMLAudioElement | null = null;

export const startMusic = () => {
  const settings = JSON.parse(
    localStorage.getItem("spy-settings") || '{"music": true}'
  );
  if (!settings.music) return;

  try {
    if (!bgAudio) {
      bgAudio = new Audio("/assets/ambient-loop.mp3");
      bgAudio.loop = true;
      bgAudio.volume = 0.15;
    }
    void bgAudio.play().catch(() => {
      /* autoplay blocked */
    });
  } catch (e) {
    console.error("Music play failed", e);
  }
};

export const stopMusic = () => {
  try {
    if (bgAudio) {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    }
  } catch {
    /* ignore */
  }
};

export const vibrate = (duration: number = 50) => {
  const settings = JSON.parse(
    localStorage.getItem("spy-settings") || '{"vibrate": true}'
  );
  if (!settings.vibrate) return;

  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};
