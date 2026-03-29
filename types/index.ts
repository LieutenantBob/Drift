import type { ComponentType, RefObject } from 'react';
import type { CanvasRef } from '@shopify/react-native-skia';

export interface WritingMetrics {
  wpm: number;
  wordCount: number;
  avgSentenceLength: number;
  punctuationDensity: number;
  timeSinceLastKeystroke: number;
}

export interface CanvasParams {
  particleCount: number;
  speed: number;
  colourTemperature: number;
  cohesion: number;
  turbulence: number;
}

export interface CanvasProps {
  params: CanvasParams;
  width: number;
  height: number;
  frozen?: boolean;
  canvasRef?: RefObject<CanvasRef | null>;
}

export interface Theme {
  id: string;
  name: string;
  artist?: string;
  tier: 'free' | 'plus' | 'pro' | 'gallery';
  editionSize?: number;
  component: ComponentType<CanvasProps>;
  defaultParams: CanvasParams;
  description: string;
  artistStatement?: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  intention: string;
  body: string;
  durationSeconds: number;
  themeId: string;
  finalParams: CanvasParams;
  thumbnailUri: string;
  weatherData?: WeatherSnapshot;
}

export interface WeatherSnapshot {
  temp: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  condition: string;
}

export type Entitlement = 'free' | 'plus' | 'pro';
