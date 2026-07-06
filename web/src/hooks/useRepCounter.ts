import { useCallback, useRef, useState } from 'react';
import type { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { calculateAngle, type Point2D } from '@/lib/angle';
import { POSE_LANDMARK } from '@/lib/landmarks';

export type CurlStage = 'down' | 'up' | null;

interface RepCounterState {
  counter: number;
  stage: CurlStage;
  angle: number | null;
  visible: boolean;
}

// Identical thresholds to the notebook's curl-counter logic.
const DOWN_THRESHOLD = 160;
const UP_THRESHOLD = 30;
const MIN_VISIBILITY = 0.5;

const INITIAL_STATE: RepCounterState = {
  counter: 0,
  stage: null,
  angle: null,
  visible: false,
};

/** Left-arm bicep-curl rep counter, a direct port of the notebook's stage machine. */
export function useRepCounter() {
  const [state, setState] = useState<RepCounterState>(INITIAL_STATE);
  const stageRef = useRef<CurlStage>(null);
  const counterRef = useRef(0);

  const processResult = useCallback((result: PoseLandmarkerResult | null) => {
    const landmarks = result?.landmarks?.[0];
    if (!landmarks) {
      setState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const shoulder = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARK.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARK.LEFT_WRIST];

    const visible =
      shoulder.visibility > MIN_VISIBILITY &&
      elbow.visibility > MIN_VISIBILITY &&
      wrist.visibility > MIN_VISIBILITY;

    if (!visible) {
      setState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const shoulderPt: Point2D = [shoulder.x, shoulder.y];
    const elbowPt: Point2D = [elbow.x, elbow.y];
    const wristPt: Point2D = [wrist.x, wrist.y];
    const angle = calculateAngle(shoulderPt, elbowPt, wristPt);

    if (angle > DOWN_THRESHOLD) {
      stageRef.current = 'down';
    }
    if (angle < UP_THRESHOLD && stageRef.current === 'down') {
      stageRef.current = 'up';
      counterRef.current += 1;
    }

    setState({
      counter: counterRef.current,
      stage: stageRef.current,
      angle,
      visible: true,
    });
  }, []);

  const reset = useCallback(() => {
    stageRef.current = null;
    counterRef.current = 0;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, processResult, reset };
}
