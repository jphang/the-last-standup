import { createContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MusicTrack } from '../lib/audioEngine';
import {
  resumeAudio,
  stopAllTracks,
  playThemeMusic,
  playCommandCenterMusic,
  playBattleAlienMusic,
  playBossBattleMusic,
  playVictoryMusic,
  playDefeatMusic,
} from '../lib/audioEngine';

export type TrackName = 'theme' | 'command' | 'battle_alien' | 'battle_boss' | 'victory' | 'defeat';

const TRACK_PLAYERS: Record<TrackName, () => MusicTrack> = {
  theme: playThemeMusic,
  command: playCommandCenterMusic,
  battle_alien: playBattleAlienMusic,
  battle_boss: playBossBattleMusic,
  victory: playVictoryMusic,
  defeat: playDefeatMusic,
};

interface MusicContextValue {
  currentTrack: TrackName | null;
  muted: boolean;
  play: (track: TrackName) => void;
  stop: () => void;
  toggleMute: () => void;
}

export const MusicContext = createContext<MusicContextValue>({
  currentTrack: null,
  muted: false,
  play: () => { },
  stop: () => { },
  toggleMute: () => { },
});

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(() => localStorage.getItem('music_muted') === '1');
  const [currentTrack, setCurrentTrack] = useState<TrackName | null>(null);
  const trackRef = useRef<MusicTrack | null>(null);
  const trackNameRef = useRef<TrackName | null>(null);

  const stopCurrent = useCallback(() => {
    stopAllTracks();
    trackRef.current = null;
    trackNameRef.current = null;
    setCurrentTrack(null);
  }, []);

  const play = useCallback((track: TrackName) => {
    if (trackNameRef.current === track && trackRef.current?.isPlaying()) return;

    stopAllTracks();
    trackRef.current = null;

    resumeAudio();

    trackNameRef.current = track;
    setCurrentTrack(track);

    const isMuted = localStorage.getItem('music_muted') === '1';
    if (!isMuted) {
      trackRef.current = TRACK_PLAYERS[track]();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem('music_muted', next ? '1' : '0');

      if (next) {
        stopAllTracks();
        trackRef.current = null;
      } else {
        resumeAudio();
        const name = trackNameRef.current;
        if (name) {
          trackRef.current = TRACK_PLAYERS[name]();
        }
      }

      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  return (
    <MusicContext.Provider value={{ currentTrack, muted, play, stop: stopCurrent, toggleMute }}>
      {children}
    </MusicContext.Provider>
  );
}

