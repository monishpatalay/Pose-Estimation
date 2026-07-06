/**
 * Subset of the 33-point MediaPipe Pose topology, matching `mp_pose.PoseLandmark`
 * index-for-index (PoseLandmarker uses the same topology as the legacy Pose solution).
 */
export const POSE_LANDMARK = {
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
} as const;
