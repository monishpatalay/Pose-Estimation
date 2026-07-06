import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurlStage } from '@/hooks/useRepCounter';

interface StatsHudProps {
  counter: number;
  stage: CurlStage;
  angle: number | null;
  visible: boolean;
}

export function StatsHud({ counter, stage, angle, visible }: StatsHudProps) {
  const counterRef = useRef<HTMLDivElement | null>(null);
  const prevCounterRef = useRef(counter);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (counter !== prevCounterRef.current && counterRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        counterRef.current,
        { scale: 1.35 },
        { scale: 1, duration: 0.4, ease: 'back.out(3)' },
      );
    }
    prevCounterRef.current = counter;
  }, [counter]);

  const stageColor =
    stage === 'up' ? 'var(--stage-up)' : stage === 'down' ? 'var(--stage-down)' : 'var(--muted)';

  return (
    <Card className="gap-0 border-white/10 bg-card/90 py-0 shadow-xl backdrop-blur-sm">
      <CardContent className="flex items-center gap-6 px-6 py-5">
        <Stat label="Reps">
          <div
            ref={counterRef}
            className="font-display text-5xl leading-none font-semibold tabular-nums"
          >
            {counter}
          </div>
        </Stat>

        <div className="h-10 w-px bg-border" aria-hidden="true" />

        <Stat label="Stage">
          <Badge
            className="border-none px-3 py-1 font-display text-base uppercase"
            style={{
              backgroundColor: stageColor,
              color: stage ? '#fff' : 'var(--muted-foreground)',
            }}
          >
            {stage ?? '—'}
          </Badge>
        </Stat>

        <div className="h-10 w-px bg-border" aria-hidden="true" />

        <Stat label="Angle">
          <div className="font-display text-2xl leading-none font-medium tabular-nums">
            {angle !== null ? `${Math.round(angle)}°` : '—'}
          </div>
        </Stat>
      </CardContent>

      {!visible && (
        <CardContent className="border-t border-border px-6 py-3 text-center text-sm text-muted-foreground">
          Step into frame and raise your left arm so it's fully visible.
        </CardContent>
      )}
    </Card>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
