import { useRef, useState, useEffect, useCallback } from 'react';
import type { WritingMetrics, CanvasParams } from '../types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

interface MetricsState {
  wordTimestamps: number[];
  lastKeystrokeTime: number;
  sessionStartTime: number;
}

export function createMetricsState(): MetricsState {
  const now = Date.now();
  return {
    wordTimestamps: [],
    lastKeystrokeTime: now,
    sessionStartTime: now,
  };
}

export function computeMetrics(
  text: string,
  state: MetricsState,
): WritingMetrics {
  const now = Date.now();
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Track word timestamps for WPM (rolling 30s window)
  if (wordCount > state.wordTimestamps.length) {
    const newWords = wordCount - state.wordTimestamps.length;
    for (let i = 0; i < newWords; i++) {
      state.wordTimestamps.push(now);
    }
  }

  // WPM: words added in the last 30 seconds
  const windowMs = 30000;
  const cutoff = now - windowMs;
  const recentWords = state.wordTimestamps.filter(t => t >= cutoff).length;
  const wpm = recentWords * 2; // 30s window × 2 = per minute

  // Average sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0
    ? wordCount / sentences.length
    : 0;

  // Punctuation density
  const punctuation = (text.match(/[,.]/g) || []).length;
  const punctuationDensity = punctuation / Math.max(wordCount, 1);

  // Time since last keystroke
  const timeSinceLastKeystroke = now - state.lastKeystrokeTime;

  return {
    wpm,
    wordCount,
    avgSentenceLength,
    punctuationDensity,
    timeSinceLastKeystroke,
  };
}

export function updateKeystrokeTime(state: MetricsState): void {
  state.lastKeystrokeTime = Date.now();
}

export function metricsToParams(metrics: WritingMetrics): CanvasParams {
  return {
    particleCount: Math.round(lerp(80, 400, Math.min(metrics.wordCount / 300, 1))),
    speed: Math.min(metrics.wpm / 80, 1.0),
    colourTemperature: Math.min(metrics.wpm / 80, 1.0),
    cohesion: Math.min(metrics.punctuationDensity * 4, 1.0),
    turbulence: Math.min(metrics.timeSinceLastKeystroke / 8000, 1.0),
  };
}

export const DEFAULT_PARAMS: CanvasParams = {
  particleCount: 80,
  speed: 0.3,
  colourTemperature: 0.2,
  cohesion: 0.4,
  turbulence: 0.0,
};

export function useSmoothParams(target: CanvasParams): CanvasParams {
  const currentRef = useRef<CanvasParams>({ ...target });
  const [smoothed, setSmoothed] = useState<CanvasParams>({ ...target });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const rate = 0.05;

    const tick = () => {
      const c = currentRef.current;
      const next: CanvasParams = {
        particleCount: Math.round(lerp(c.particleCount, target.particleCount, rate)),
        speed: lerp(c.speed, target.speed, rate),
        colourTemperature: lerp(c.colourTemperature, target.colourTemperature, rate),
        cohesion: lerp(c.cohesion, target.cohesion, rate),
        turbulence: lerp(c.turbulence, target.turbulence, rate),
      };
      currentRef.current = next;
      setSmoothed({ ...next });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target.particleCount, target.speed, target.colourTemperature, target.cohesion, target.turbulence]);

  return smoothed;
}
