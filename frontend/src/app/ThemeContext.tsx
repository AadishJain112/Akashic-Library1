import React, { createContext, useContext, useEffect, useState } from 'react';

export type ReadingMood = 'morning' | 'golden' | 'garden';

interface ThemeContextType {
  mood: ReadingMood;
  setMood: (mood: ReadingMood) => void;
  lite3D: boolean;
  setLite3D: (lite: boolean) => void;
  toggleLite3D: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playThunk: () => void;
  playPageTurn: () => void;
  playBrassClick: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<ReadingMood>(() => {
    return (localStorage.getItem('akashic_mood') as ReadingMood) || 'morning';
  });

  const [lite3D, setLite3DState] = useState<boolean>(() => {
    const saved = localStorage.getItem('akashic_lite_3d');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      return prefersReduced || isMobile;
    }
    return false;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('akashic_sound') === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood);
    localStorage.setItem('akashic_mood', mood);
  }, [mood]);

  useEffect(() => {
    localStorage.setItem('akashic_lite_3d', String(lite3D));
  }, [lite3D]);

  useEffect(() => {
    localStorage.setItem('akashic_sound', String(soundEnabled));
  }, [soundEnabled]);

  const setMood = (newMood: ReadingMood) => {
    setMoodState(newMood);
  };

  const setLite3D = (lite: boolean) => {
    setLite3DState(lite);
  };

  const toggleLite3D = () => {
    setLite3DState((prev) => !prev);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  // Synthesized Web Audio API sound effects for zero-dependency library audio
  const playPageTurn = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      noise.connect(filter);
      filter.connect(ctx.destination);
      noise.start();
    } catch {
      // AudioContext may be blocked before interaction
    }
  };

  const playBrassClick = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  };

  const playThunk = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        mood,
        setMood,
        lite3D,
        setLite3D,
        toggleLite3D,
        soundEnabled,
        setSoundEnabled,
        playThunk,
        playPageTurn,
        playBrassClick,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
