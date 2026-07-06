import { useState } from 'react';
import { Hero } from '@/components/landing/Hero';
import { FeatureBento } from '@/components/landing/FeatureBento';
import { PrivacyNote } from '@/components/landing/PrivacyNote';
import { CameraStage } from '@/components/tracker/CameraStage';

function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <CameraStage onExit={() => setStarted(false)} />;
  }

  return (
    <div className="min-h-dvh bg-background">
      <Hero onStart={() => setStarted(true)} />
      <FeatureBento />
      <PrivacyNote />
    </div>
  );
}

export default App;
