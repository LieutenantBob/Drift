import React, { useRef, useState, useEffect } from 'react';
import { Canvas, Path, Rect, useCanvasRef } from '@shopify/react-native-skia';
import type { CanvasProps } from '../../types';
import {
  initBoids,
  stepBoids,
  resizeBoids,
  boidPath,
  boidColor,
} from '../../lib/themes/murmuration';
import type { Boid } from '../../lib/themes/murmuration';

export function MurmurationCanvas({
  params,
  width,
  height,
  frozen,
  canvasRef: externalRef,
}: CanvasProps) {
  const internalRef = useCanvasRef();
  const ref = externalRef ?? internalRef;
  const boidsRef = useRef<Boid[]>(initBoids(80, width, height));
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number>(0);

  // Resize boid population when particleCount changes
  useEffect(() => {
    boidsRef.current = resizeBoids(
      boidsRef.current,
      params.particleCount,
      width,
      height,
    );
  }, [params.particleCount, width, height]);

  useEffect(() => {
    if (frozen) return;
    const tick = () => {
      boidsRef.current = stepBoids(boidsRef.current, params, width, height);
      setFrame((f) => f + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params, frozen, width, height]);

  return (
    <Canvas ref={ref} style={{ width, height }}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        color="rgba(8,7,14,0.28)"
      />
      {boidsRef.current.map((b, i) => (
        <Path key={i} path={boidPath(b)} color={boidColor(b, params)} />
      ))}
    </Canvas>
  );
}
