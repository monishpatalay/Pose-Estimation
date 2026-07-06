import { useEffect, useRef, useState, type RefObject } from 'react';
import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_ASSET_PATH = `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`;

export type PoseLandmarkerStatus = 'loading' | 'ready' | 'error';

/**
 * Loads MediaPipe's PoseLandmarker (WASM, runs fully client-side) and drives a
 * detectForVideo loop on rAF while `active` is true. Model asset is self-hosted
 * under public/models for reliable, cacheable loads; only the runtime WASM
 * binaries come from jsdelivr (standard, vetted CDN for this library).
 */
export function usePoseLandmarker(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  onResult: (result: PoseLandmarkerResult) => void,
) {
  const [status, setStatus] = useState<PoseLandmarkerStatus>('loading');
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    init();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!active || status !== 'ready') return;

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        onResultRef.current(result);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, status, videoRef]);

  return { status };
}
