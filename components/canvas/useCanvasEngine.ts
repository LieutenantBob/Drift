import { useRef, useCallback } from 'react';
import {
  createMetricsState,
  computeMetrics,
  updateKeystrokeTime,
  metricsToParams,
  useSmoothParams,
  DEFAULT_PARAMS,
} from '../../lib/writingMetrics';
import type { CanvasParams } from '../../types';

export function useCanvasEngine() {
  const metricsStateRef = useRef(createMetricsState());
  const targetParamsRef = useRef<CanvasParams>(DEFAULT_PARAMS);

  const onTextChange = useCallback((text: string) => {
    updateKeystrokeTime(metricsStateRef.current);
    const metrics = computeMetrics(text, metricsStateRef.current);
    targetParamsRef.current = metricsToParams(metrics);
  }, []);

  const smoothedParams = useSmoothParams(targetParamsRef.current);

  return {
    params: smoothedParams,
    onTextChange,
  };
}
