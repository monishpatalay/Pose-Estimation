import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from 'react';
import { DrawingUtils, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';

export interface PoseCanvasHandle {
  draw: (result: PoseLandmarkerResult | null) => void;
}

interface PoseCanvasProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * Transparent overlay canvas drawing the skeleton. Exposes an imperative
 * `draw()` handle so the ~30-60fps detection loop can paint directly without
 * routing every frame through React state/render.
 */
export const PoseCanvas = forwardRef<PoseCanvasHandle, PoseCanvasProps>(function PoseCanvas(
  { videoRef },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    function syncSize() {
      if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    video.addEventListener('loadedmetadata', syncSize);
    syncSize();
    return () => video.removeEventListener('loadedmetadata', syncSize);
  }, [videoRef]);

  useImperativeHandle(ref, () => ({
    draw(result) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      if (!drawingUtilsRef.current) {
        drawingUtilsRef.current = new DrawingUtils(ctx);
      }
      const drawingUtils = drawingUtilsRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = result?.landmarks?.[0];
      if (landmarks) {
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: '#f97316',
          lineWidth: 3,
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: '#059669',
          fillColor: '#059669',
          radius: 4,
        });
      }
    },
  }));

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
});
