import { ShieldCheck } from 'lucide-react';

/** Builds trust before asking a cold visitor to grant camera access. */
export function PrivacyNote() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <div className="flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/10 p-6">
        <ShieldCheck className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <h3 className="font-display text-lg font-semibold">Your camera feed never leaves this tab</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pose detection runs fully in your browser using an on-device WebAssembly model
            (MediaPipe). No frame is ever uploaded, recorded, or sent to a server.
          </p>
        </div>
      </div>
    </section>
  );
}
