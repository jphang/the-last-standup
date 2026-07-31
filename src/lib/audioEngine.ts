type NoteEntry = [number, number, number];

let audioCtx: AudioContext | null = null;
const activeTracks = new Set<MusicTrack>();

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function resumeAudio() {
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume();
  }
}

export function stopAllTracks() {
  activeTracks.forEach((t) => t.stop());
  activeTracks.clear();
}

function createOsc(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  gain: number,
  start: number,
  dur: number,
  dest: AudioNode,
  oscList: OscillatorNode[],
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + dur);
  oscList.push(osc);
  osc.onended = () => {
    const idx = oscList.indexOf(osc);
    if (idx !== -1) oscList.splice(idx, 1);
  };
}

function noteToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

export interface MusicTrack {
  stop: () => void;
  isPlaying: () => boolean;
}

function playLoop(
  melody: NoteEntry[],
  bass: NoteEntry[],
  bpm: number,
  melodyWave: OscillatorType,
  bassWave: OscillatorType,
  melodyVol: number,
  bassVol: number,
): MusicTrack {
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const activeOscs: OscillatorNode[] = [];

  const beatLen = 60 / bpm;

  function scheduleLoop() {
    if (stopped) return;

    const now = ctx.currentTime + 0.05;

    let melodyEnd = 0;
    for (const [note, startBeat, durBeats] of melody) {
      const t = now + startBeat * beatLen;
      const d = durBeats * beatLen;
      if (note > 0) {
        createOsc(ctx, melodyWave, noteToFreq(note), melodyVol, t, d, master, activeOscs);
      }
      melodyEnd = Math.max(melodyEnd, (startBeat + durBeats) * beatLen);
    }

    let bassEnd = 0;
    for (const [note, startBeat, durBeats] of bass) {
      const t = now + startBeat * beatLen;
      const d = durBeats * beatLen;
      if (note > 0) {
        createOsc(ctx, bassWave, noteToFreq(note), bassVol, t, d, master, activeOscs);
      }
      bassEnd = Math.max(bassEnd, (startBeat + durBeats) * beatLen);
    }

    const loopLen = Math.max(melodyEnd, bassEnd);
    timeoutId = setTimeout(() => scheduleLoop(), loopLen * 1000 - 100);
  }

  scheduleLoop();

  const track: MusicTrack = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      activeOscs.forEach((o) => { try { o.stop(0); } catch(e) {console.debug("Caught exception", e)} });
      activeOscs.length = 0;
      try { master.disconnect(); } catch(e) {console.debug("Caught exception", e)}
      activeTracks.delete(track);
    },
    isPlaying: () => !stopped,
  };

  activeTracks.add(track);
  return track;
}

// C=60, D=62, E=64, F=65, G=67, A=69, B=71
// octaves: C4=60, C5=72, C3=48

export function playThemeMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [72, 0, 0.5], [72, 0.5, 0.25], [74, 0.75, 0.25], [76, 1, 0.5], [79, 1.5, 0.5],
    [81, 2, 0.25], [79, 2.25, 0.25], [76, 2.5, 0.5], [74, 3, 0.25], [76, 3.25, 0.25],
    [72, 3.5, 0.5],

    [72, 4, 0.5], [74, 4.5, 0.25], [76, 4.75, 0.25], [79, 5, 0.5], [81, 5.5, 0.25],
    [83, 5.75, 0.25], [84, 6, 0.5], [83, 6.5, 0.25], [81, 6.75, 0.25],
    [79, 7, 0.5], [76, 7.5, 0.5],

    [84, 8, 0.25], [83, 8.25, 0.25], [81, 8.5, 0.25], [79, 8.75, 0.25],
    [81, 9, 0.5], [84, 9.5, 0.5],
    [83, 10, 0.25], [81, 10.25, 0.25], [79, 10.5, 0.25], [76, 10.75, 0.25],
    [77, 11, 0.5], [76, 11.5, 0.25], [74, 11.75, 0.25],

    [72, 12, 0.5], [74, 12.5, 0.25], [76, 12.75, 0.25],
    [79, 13, 0.25], [81, 13.25, 0.25], [83, 13.5, 0.25], [84, 13.75, 0.25],
    [86, 14, 0.5], [84, 14.5, 0.25], [81, 14.75, 0.25],
    [79, 15, 0.5], [72, 15.5, 0.5],
  ];

  const bass: NoteEntry[] = [
    [48, 0, 0.5], [48, 0.5, 0.5], [48, 1, 0.5], [48, 1.5, 0.5],
    [45, 2, 0.5], [45, 2.5, 0.5], [43, 3, 0.5], [43, 3.5, 0.5],
    [48, 4, 0.5], [48, 4.5, 0.5], [48, 5, 0.5], [48, 5.5, 0.5],
    [53, 6, 0.5], [53, 6.5, 0.5], [48, 7, 0.5], [48, 7.5, 0.5],
    [53, 8, 0.5], [53, 8.5, 0.5], [52, 9, 0.5], [52, 9.5, 0.5],
    [48, 10, 0.5], [48, 10.5, 0.5], [45, 11, 0.5], [45, 11.5, 0.5],
    [48, 12, 0.5], [48, 12.5, 0.5], [48, 13, 0.5], [48, 13.5, 0.5],
    [45, 14, 0.5], [43, 14.5, 0.5], [48, 15, 0.5], [48, 15.5, 0.5],
  ];

  return playLoop(melody, bass, 155, 'square', 'sawtooth', 0.15, 0.11);
}

export function playCommandCenterMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [64, 0, 1], [67, 1, 0.5], [69, 1.5, 0.5], [71, 2, 1.5],
    [69, 3.5, 0.5], [67, 4, 1], [64, 5, 0.5], [67, 5.5, 0.5],
    [69, 6, 2],

    [71, 8, 1], [72, 9, 0.5], [74, 9.5, 0.5], [76, 10, 1],
    [74, 11, 0.5], [72, 11.5, 0.5], [71, 12, 1], [69, 13, 0.5],
    [67, 13.5, 0.5], [64, 14, 2],

    [60, 16, 0.5], [62, 16.5, 0.5], [64, 17, 1], [67, 18, 0.5],
    [69, 18.5, 0.5], [71, 19, 1.5], [69, 20.5, 0.5],
    [67, 21, 1], [64, 22, 2],

    [69, 24, 0.5], [71, 24.5, 0.5], [72, 25, 1], [71, 26, 0.5],
    [69, 26.5, 0.5], [67, 27, 1], [64, 28, 1], [62, 29, 1],
    [64, 30, 2],
  ];

  const bass: NoteEntry[] = [
    [48, 0, 2], [48, 2, 2], [45, 4, 2], [48, 6, 2],
    [47, 8, 2], [48, 10, 2], [45, 12, 2], [48, 14, 2],
    [48, 16, 2], [43, 18, 2], [47, 20, 2], [48, 22, 2],
    [45, 24, 2], [48, 26, 2], [43, 28, 2], [48, 30, 2],
  ];

  return playLoop(melody, bass, 95, 'square', 'triangle', 0.12, 0.1);
}

export function playBattleAlienMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [72, 0, 0.5], [72, 0.5, 0.5], [74, 1, 0.5], [76, 1.5, 0.5],
    [79, 2, 0.5], [76, 2.5, 0.5], [74, 3, 0.5], [72, 3.5, 0.5],

    [71, 4, 0.5], [72, 4.5, 0.5], [74, 5, 0.5], [71, 5.5, 0.5],
    [72, 6, 0.5], [69, 6.5, 0.5], [67, 7, 0.5], [69, 7.5, 0.5],

    [72, 8, 0.5], [74, 8.5, 0.5], [76, 9, 0.5], [79, 9.5, 0.5],
    [81, 10, 0.5], [79, 10.5, 0.5], [76, 11, 0.5], [74, 11.5, 0.5],

    [76, 12, 0.5], [74, 12.5, 0.5], [72, 13, 0.5], [71, 13.5, 0.5],
    [72, 14, 1], [0, 15, 1],
  ];

  const bass: NoteEntry[] = [
    [48, 0, 0.5], [48, 1, 0.5], [48, 2, 0.5], [48, 3, 0.5],
    [45, 4, 0.5], [45, 5, 0.5], [43, 6, 0.5], [43, 7, 0.5],
    [48, 8, 0.5], [48, 9, 0.5], [48, 10, 0.5], [48, 11, 0.5],
    [45, 12, 0.5], [43, 13, 0.5], [48, 14, 1], [48, 15, 1],
  ];

  return playLoop(melody, bass, 160, 'square', 'sawtooth', 0.14, 0.1);
}

export function playBossBattleMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [72, 0, 0.25], [71, 0.25, 0.25], [72, 0.5, 0.25], [74, 0.75, 0.25],
    [76, 1, 0.5], [79, 1.5, 0.5],
    [81, 2, 0.25], [79, 2.25, 0.25], [76, 2.5, 0.25], [79, 2.75, 0.25],
    [81, 3, 0.5], [84, 3.5, 0.5],

    [83, 4, 0.5], [81, 4.5, 0.5], [79, 5, 0.5], [76, 5.5, 0.5],
    [77, 6, 0.25], [76, 6.25, 0.25], [74, 6.5, 0.25], [72, 6.75, 0.25],
    [74, 7, 0.5], [76, 7.5, 0.5],

    [72, 8, 0.25], [74, 8.25, 0.25], [76, 8.5, 0.5],
    [79, 9, 0.25], [81, 9.25, 0.25], [83, 9.5, 0.5],
    [84, 10, 0.5], [83, 10.5, 0.25], [81, 10.75, 0.25],
    [79, 11, 0.5], [76, 11.5, 0.5],

    [77, 12, 0.5], [76, 12.5, 0.25], [74, 12.75, 0.25],
    [72, 13, 0.5], [74, 13.5, 0.5],
    [76, 14, 0.5], [72, 14.5, 0.5],
    [0, 15, 0.5], [72, 15.5, 0.5],
  ];

  const bass: NoteEntry[] = [
    [36, 0, 0.5], [36, 0.5, 0.5], [36, 1, 0.5], [36, 1.5, 0.5],
    [39, 2, 0.5], [39, 2.5, 0.5], [36, 3, 0.5], [36, 3.5, 0.5],
    [41, 4, 0.5], [41, 4.5, 0.5], [40, 5, 0.5], [40, 5.5, 0.5],
    [38, 6, 0.5], [38, 6.5, 0.5], [36, 7, 0.5], [36, 7.5, 0.5],
    [36, 8, 0.5], [36, 8.5, 0.5], [39, 9, 0.5], [39, 9.5, 0.5],
    [41, 10, 0.5], [41, 10.5, 0.5], [40, 11, 0.5], [40, 11.5, 0.5],
    [38, 12, 0.5], [38, 12.5, 0.5], [36, 13, 0.5], [36, 13.5, 0.5],
    [36, 14, 0.5], [36, 14.5, 0.5], [36, 15, 0.5], [36, 15.5, 0.5],
  ];

  return playLoop(melody, bass, 180, 'square', 'sawtooth', 0.15, 0.12);
}

export function playVictoryMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [72, 0, 0.5], [74, 0.5, 0.5], [76, 1, 0.5], [79, 1.5, 1.5],
    [76, 3, 0.5], [79, 3.5, 0.5], [81, 4, 0.5], [84, 4.5, 1.5],

    [81, 6, 0.5], [84, 6.5, 0.5], [86, 7, 0.5], [88, 7.5, 2],
    [86, 9.5, 0.5], [84, 10, 0.5], [81, 10.5, 0.5],
    [84, 11, 1], [81, 12, 1],
    [79, 13, 1], [76, 14, 2],

    [72, 16, 0.5], [76, 16.5, 0.5], [79, 17, 1],
    [81, 18, 0.5], [79, 18.5, 0.5], [76, 19, 1],
    [72, 20, 0.5], [74, 20.5, 0.5], [76, 21, 1],
    [79, 22, 2],

    [84, 24, 0.5], [81, 24.5, 0.5], [84, 25, 0.5], [86, 25.5, 0.5],
    [88, 26, 2], [86, 28, 1], [84, 29, 1],
    [81, 30, 2],
  ];

  const bass: NoteEntry[] = [
    [48, 0, 2], [48, 2, 2], [53, 4, 2], [53, 6, 2],
    [55, 8, 2], [53, 10, 2], [48, 12, 2], [48, 14, 2],
    [48, 16, 2], [53, 18, 2], [48, 20, 2], [55, 22, 2],
    [53, 24, 2], [55, 26, 2], [53, 28, 2], [48, 30, 2],
  ];

  return playLoop(melody, bass, 120, 'square', 'triangle', 0.14, 0.1);
}

export function playDefeatMusic(): MusicTrack {
  const melody: NoteEntry[] = [
    [72, 0, 1.5], [71, 1.5, 1.5], [69, 3, 1.5], [67, 4.5, 1.5],
    [65, 6, 2],

    [64, 8, 1], [65, 9, 1], [67, 10, 1], [65, 11, 1],
    [64, 12, 2], [60, 14, 2],

    [67, 16, 1.5], [65, 17.5, 1.5], [64, 19, 1.5], [62, 20.5, 1.5],
    [60, 22, 2],

    [64, 24, 1], [62, 25, 1], [60, 26, 1], [59, 27, 1],
    [60, 28, 4],
  ];

  const bass: NoteEntry[] = [
    [48, 0, 3], [47, 3, 3], [45, 6, 2],
    [40, 8, 2], [41, 10, 2], [40, 12, 2], [36, 14, 2],
    [43, 16, 3], [41, 19, 3], [36, 22, 2],
    [40, 24, 2], [38, 26, 2], [36, 28, 4],
  ];

  return playLoop(melody, bass, 70, 'triangle', 'sine', 0.12, 0.08);
}
