import { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import type { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/useWebcam';
import { usePoseLandmarker } from '@/hooks/usePoseLandmarker';
import { useRepCounter } from '@/hooks/useRepCounter';
import { PoseCanvas, type PoseCanvasHandle } from './PoseCanvas';
import { StatsHud } from './StatsHud';
import { PermissionGate } from './PermissionGate';

interface CameraStageProps {
  onExit: () => void;
}

export function CameraStage({ onExit }: CameraStageProps) {
  const { videoRef, status: webcamStatus, start, stop } = useWebcam();
  const canvasApiRef = useRef<PoseCanvasHandle | null>(null);
  const { counter, stage, angle, visible, processResult, reset } = useRepCounter();

  const handleResult = useCallback(
    (result: PoseLandmarkerResult) => {
      canvasApiRef.current?.draw(result);
      processResult(result);
    },
    [processResult],
  );

  const { status: modelStatus } = usePoseLandmarker(
    videoRef,
    webcamStatus === 'ready',
    handleResult,
  );

  useEffect(() => {
    start();
    return () => stop();
    // Start the camera once on mount; `start`/`stop` are stable useCallback refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showGate =
    webcamStatus === 'denied' ||
    webcamStatus === 'no-camera' ||
    webcamStatus === 'error' ||
    modelStatus === 'error';
  const isLoading = webcamStatus === 'requesting' || (webcamStatus === 'ready' && modelStatus === 'loading');

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Button variant="ghost" onClick={onExit} className="cursor-pointer gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button variant="ghost" onClick={reset} className="cursor-pointer gap-2">
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10">
        <div className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl sm:aspect-video">
          <div className="absolute inset-0 -scale-x-100">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            <PoseCanvas ref={canvasApiRef} videoRef={videoRef} />
          </div>

          {showGate && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95">
              <PermissionGate webcamStatus={webcamStatus} modelStatus={modelStatus} onRetry={start} />
            </div>
          )}

          {!showGate && isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" aria-hidden="true" />
              <p className="text-sm">
                {webcamStatus === 'requesting' ? 'Requesting camera access…' : 'Loading pose model…'}
              </p>
            </div>
          )}
        </div>

        {!showGate && <StatsHud counter={counter} stage={stage} angle={angle} visible={visible} />}
      </main>
    </div>
  );
}
