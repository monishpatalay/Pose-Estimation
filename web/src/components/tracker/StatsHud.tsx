import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ArmState } from '@/hooks/useRepCounter';

interface StatsHudProps {
  left: ArmState;
  right: ArmState;
}

export function StatsHud({ left, right }: StatsHudProps) {
  const total = left.counter + right.counter;
  const totalRef = useRef<HTMLDivElement | null>(null);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (total !== prevTotalRef.current && totalRef.current && !prefersReducedMotion) {
      gsap.fromTo(totalRef.current, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    }
    prevTotalRef.current = total;
  }, [total]);

  const bothHidden = !left.visible && !right.visible;
  const onlyOneHidden = !bothHidden && (!left.visible || !right.visible);

  return (
    <Card className="gap-0 border-white/10 bg-card/90 py-0 shadow-xl backdrop-blur-sm">
      <CardContent className="flex items-center gap-6 px-6 py-5">
        <ArmColumn label="Left arm" arm={left} />

        <div className="h-14 w-px bg-border" aria-hidden="true" />

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Total
          </span>
          <div
            ref={totalRef}
            className="font-display text-5xl leading-none font-semibold tabular-nums"
          >
            {total}
          </div>
        </div>

        <div className="h-14 w-px bg-border" aria-hidden="true" />

        <ArmColumn label="Right arm" arm={right} />
      </CardContent>

      {(bothHidden || onlyOneHidden) && (
        <CardContent className="border-t border-border px-6 py-3 text-center text-sm text-muted-foreground">
          {bothHidden
            ? "Step into frame — make sure at least one arm is fully visible."
            : `Raise your ${!left.visible ? 'left' : 'right'} arm so it's fully visible too.`}
        </CardContent>
      )}
    </Card>
  );
}

function ArmColumn({ label, arm }: { label: string; arm: ArmState }) {
  const counterRef = useRef<HTMLDivElement | null>(null);
  const prevCounterRef = useRef(arm.counter);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (arm.counter !== prevCounterRef.current && counterRef.current && !prefersReducedMotion) {
      gsap.fromTo(counterRef.current, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    }
    prevCounterRef.current = arm.counter;
  }, [arm.counter]);

  const stageColor =
    arm.stage === 'up' ? 'var(--stage-up)' : arm.stage === 'down' ? 'var(--stage-down)' : 'var(--muted)';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <div ref={counterRef} className="font-display text-3xl leading-none font-semibold tabular-nums">
        {arm.counter}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className="border-none px-2 py-0.5 font-display text-xs uppercase"
          style={{
            backgroundColor: stageColor,
            color: arm.stage ? '#fff' : 'var(--muted-foreground)',
          }}
        >
          {arm.stage ?? '—'}
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums">
          {arm.angle !== null ? `${Math.round(arm.angle)}°` : '—'}
        </span>
      </div>
    </div>
  );
}
