import { create } from 'zustand';
import type { CanvasParams } from '../types';
import { DEFAULT_PARAMS } from '../lib/writingMetrics';

interface SessionState {
  sessionId: string | null;
  intention: string;
  durationSeconds: number;
  themeId: string;
  body: string;
  elapsedSeconds: number;
  isActive: boolean;
  hasEnded: boolean;
  currentParams: CanvasParams;

  startSession: (config: {
    sessionId: string;
    intention: string;
    durationSeconds: number;
    themeId: string;
  }) => void;
  updateBody: (body: string) => void;
  updateElapsed: (seconds: number) => void;
  updateParams: (params: CanvasParams) => void;
  endSession: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  intention: '',
  durationSeconds: 300,
  themeId: 'murmuration',
  body: '',
  elapsedSeconds: 0,
  isActive: false,
  hasEnded: false,
  currentParams: DEFAULT_PARAMS,

  startSession: (config) =>
    set({
      sessionId: config.sessionId,
      intention: config.intention,
      durationSeconds: config.durationSeconds,
      themeId: config.themeId,
      body: '',
      elapsedSeconds: 0,
      isActive: true,
      hasEnded: false,
      currentParams: DEFAULT_PARAMS,
    }),

  updateBody: (body) => set({ body }),
  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  updateParams: (params) => set({ currentParams: params }),

  endSession: () =>
    set({ isActive: false, hasEnded: true }),

  resetSession: () =>
    set({
      sessionId: null,
      intention: '',
      durationSeconds: 300,
      themeId: 'murmuration',
      body: '',
      elapsedSeconds: 0,
      isActive: false,
      hasEnded: false,
      currentParams: DEFAULT_PARAMS,
    }),
}));
