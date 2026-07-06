import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !rootRef.current) return;

    const targets = rootRef.current.querySelectorAll('[data-hero-item]');
    gsap.fromTo(
      targets,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
    );
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-40 -left-16 size-64 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <div
          data-hero-item
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Dumbbell className="size-4 text-primary" aria-hidden="true" />
          Runs entirely on your device
        </div>

        <h1 data-hero-item className="font-display text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
          Count your curls.
          <br />
          <span className="text-primary">Perfect your form.</span>
        </h1>

        <p data-hero-item className="mt-6 max-w-xl text-lg text-muted-foreground">
          RepCount AI watches your webcam with real-time pose estimation, counts every bicep
          curl rep, and shows you the exact joint angle live — no app, no signup.
        </p>

        <div data-hero-item className="mt-9">
          <Button size="lg" onClick={onStart} className="cursor-pointer gap-2 text-base">
            Start tracking
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
