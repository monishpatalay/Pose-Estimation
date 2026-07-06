import { Camera, Eye, Gauge, ShieldCheck, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  wide?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Gauge,
    title: 'Real-time rep counting',
    body: 'Tracks the shoulder-elbow-wrist angle every frame and counts each curl the instant you complete it.',
    wide: true,
  },
  {
    icon: ShieldCheck,
    title: '100% private',
    body: 'Your video never leaves your browser — pose detection runs on-device.',
  },
  {
    icon: Eye,
    title: 'Live skeleton overlay',
    body: 'See exactly what the model sees, drawn over your feed in real time.',
  },
  {
    icon: Camera,
    title: 'No install, no signup',
    body: 'Just a webcam and a browser. Open the link and start your set.',
    wide: true,
  },
];

export function FeatureBento() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body, wide }) => (
          <div
            key={title}
            className={`rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-primary/40 ${wide ? 'sm:col-span-2' : ''}`}
          >
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
