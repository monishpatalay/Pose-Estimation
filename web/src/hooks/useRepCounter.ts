import { useCallback, useRef, useState } from 'react';
import type { NormalizedLandmark, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { calculateAngle, type Point2D } from '@/lib/angle';
import { POSE_LANDMARK } from '@/lib/landmarks';

export type CurlStage = 'down' | 'up' | null;
export type ArmSide = 'left' | 'right';

export interface ArmState {
  counter: number;
  stage: CurlStage;
  angle: number | null;
  visible: boolean;
}

interface RepCounterState {
  left: ArmState;
  right: ArmState;
}

// Identical thresholds to the notebook's curl-counter logic, applied per arm.
const DOWN_THRESHOLD = 160;
const UP_THRESHOLD = 30;
const MIN_VISIBILITY = 0.5;

const INITIAL_ARM_STATE: ArmState = { counter: 0, stage: null, angle: null, visible: false };
const INITIAL_STATE: RepCounterState = { left: INITIAL_ARM_STATE, right: INITIAL_ARM_STATE };

const ARM_LANDMARKS: Record<ArmSide, { shoulder: number; elbow: number; wrist: number }> = {
  left: {
    shoulder: POSE_LANDMARK.LEFT_SHOULDER,
    elbow: POSE_LANDMARK.LEFT_ELBOW,
    wrist: POSE_LANDMARK.LEFT_WRIST,
  },
  right: {
    shoulder: POSE_LANDMARK.RIGHT_SHOULDER,
    elbow: POSE_LANDMARK.RIGHT_ELBOW,
    wrist: POSE_LANDMARK.RIGHT_WRIST,
  },
};

interface ArmRefs {
  stage: Record<ArmSide, CurlStage>;
  counter: Record<ArmSide, number>;
}

function evaluateArm(landmarks: NormalizedLandmark[], side: ArmSide, refs: ArmRefs): ArmState {
  const { shoulder: s, elbow: e, wrist: w } = ARM_LANDMARKS[side];
  const shoulder = landmarks[s];
  const elbow = landmarks[e];
  const wrist = landmarks[w];

  const visible =
    shoulder.visibility > MIN_VISIBILITY &&
    elbow.visibility > MIN_VISIBILITY &&
    wrist.visibility > MIN_VISIBILITY;

  if (!visible) {
    return { counter: refs.counter[side], stage: refs.stage[side], angle: null, visible: false };
  }

  const shoulderPt: Point2D = [shoulder.x, shoulder.y];
  const elbowPt: Point2D = [elbow.x, elbow.y];
  const wristPt: Point2D = [wrist.x, wrist.y];
  const angle = calculateAngle(shoulderPt, elbowPt, wristPt);

  if (angle > DOWN_THRESHOLD) {
    refs.stage[side] = 'down';
  }
  if (angle < UP_THRESHOLD && refs.stage[side] === 'down') {
    refs.stage[side] = 'up';
    refs.counter[side] += 1;
  }

  return {
    counter: refs.counter[side],
    stage: refs.stage[side],
    angle,
    visible: true,
  };
}

/** Bicep-curl rep counter tracking both arms independently, ported from the notebook's stage machine. */
export function useRepCounter() {
  const [state, setState] = useState<RepCounterState>(INITIAL_STATE);
  const refs = useRef<ArmRefs>({
    stage: { left: null, right: null },
    counter: { left: 0, right: 0 },
  });

  const processResult = useCallback((result: PoseLandmarkerResult | null) => {
    const landmarks = result?.landmarks?.[0];
    if (!landmarks) {
      setState((prev) =>
        !prev.left.visible && !prev.right.visible
          ? prev
          : {
              left: { ...prev.left, visible: false, angle: null },
              right: { ...prev.right, visible: false, angle: null },
            },
      );
      return;
    }

    setState({
      left: evaluateArm(landmarks, 'left', refs.current),
      right: evaluateArm(landmarks, 'right', refs.current),
    });
  }, []);

  const reset = useCallback(() => {
    refs.current = { stage: { left: null, right: null }, counter: { left: 0, right: 0 } };
    setState(INITIAL_STATE);
  }, []);

  return { ...state, processResult, reset };
}
