import { CameraOff, RefreshCw, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WebcamStatus } from '@/hooks/useWebcam';
import type { PoseLandmarkerStatus } from '@/hooks/usePoseLandmarker';

interface PermissionGateProps {
  webcamStatus: WebcamStatus;
  modelStatus: PoseLandmarkerStatus;
  onRetry: () => void;
}

const WEBCAM_COPY: Partial<Record<WebcamStatus, { icon: typeof CameraOff; title: string; body: string }>> = {
  denied: {
    icon: CameraOff,
    title: 'Camera access denied',
    body: "RepCount AI needs your camera to count reps. Allow camera access in your browser's site settings, then try again.",
  },
  'no-camera': {
    icon: VideoOff,
    title: 'No camera found',
    body: "We couldn't find a webcam on this device. Try again on a device with a camera.",
  },
  error: {
    icon: CameraOff,
    title: 'Something went wrong',
    body: "We couldn't start your camera. Check that no other app is using it, then try again.",
  },
};

/** Explicit feedback for every non-happy-path state — this link gets opened cold by strangers. */
export function PermissionGate({ webcamStatus, modelStatus, onRetry }: PermissionGateProps) {
  if (modelStatus === 'error') {
    return (
      <GateMessage
        icon={CameraOff}
        title="Couldn't load the pose model"
        body="The on-device AI model failed to load. Check your connection and try again."
        onRetry={onRetry}
      />
    );
  }

  const copy = WEBCAM_COPY[webcamStatus];
  if (!copy) return null;

  return <GateMessage icon={copy.icon} title={copy.title} body={copy.body} onRetry={onRetry} />;
}

function GateMessage({
  icon: Icon,
  title,
  body,
  onRetry,
}: {
  icon: typeof CameraOff;
  title: string;
  body: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 text-center">
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      <Button onClick={onRetry} className="cursor-pointer">
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
