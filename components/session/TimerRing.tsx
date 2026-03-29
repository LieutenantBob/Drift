import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';

interface TimerRingProps {
  elapsedSeconds: number;
  totalSeconds: number;
}

export function TimerRing({ elapsedSeconds, totalSeconds }: TimerRingProps) {
  const size = 44;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - 4) / 2;
  const progress = Math.min(elapsedSeconds / totalSeconds, 1);
  const sweepAngle = progress * 360;

  // Create arc path
  const path = Skia.Path.Make();
  if (sweepAngle > 0) {
    const startAngle = -90; // top of circle
    path.addArc(
      { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 },
      startAngle,
      sweepAngle,
    );
  }

  return (
    <Canvas style={styles.container}>
      {/* Background ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        color="transparent"
        style="stroke"
        strokeWidth={2}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        color="rgba(255,255,255,0.07)"
        style="stroke"
        strokeWidth={2}
      />
      {/* Progress arc */}
      {sweepAngle > 0 && (
        <Path
          path={path}
          color="rgba(196,135,90,0.45)"
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
        />
      )}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
  },
});
