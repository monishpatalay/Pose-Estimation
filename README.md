# Pose Estimation — Bicep Curl Counter

A real-time bicep-curl rep counter built on MediaPipe's Pose model. It detects body landmarks, computes the elbow joint angle (shoulder → elbow → wrist), and counts a rep every time the arm completes a full "down → up" cycle.

The project exists in two forms:

| | Notebook (`mediapipe.ipynb`) | Web App (`web/`) |
|---|---|---|
| Runtime | Python, local webcam via OpenCV | Browser, client-side WASM |
| Audience | Local prototyping / experimentation | Anyone with the link |
| Deployment | None — runs in Jupyter | [**Live on Vercel**](https://web-ten-xi-38.vercel.app) |

**Try it live: https://web-ten-xi-38.vercel.app** — no install, no signup, works on any device with a webcam and a browser.

## How It Works

Both implementations run the same algorithm; only the runtime differs.

1. **Pose detection** — Every video frame is run through MediaPipe's Pose model, which returns 33 normalized body landmarks (`x, y, z, visibility`) per detected person.
2. **Angle calculation** — The shoulder, elbow, and wrist landmarks for an arm are fed into an angle function based on `atan2`:

   ```
   angle = |atan2(wrist.y - elbow.y, wrist.x - elbow.x)
          - atan2(shoulder.y - elbow.y, shoulder.x - elbow.x)| in degrees

   if angle > 180: angle = 360 - angle
   ```

   This gives the interior angle at the elbow, in the range `[0°, 180°]` — roughly 180° for a straight arm and under 30° for a fully curled one.
3. **Rep state machine** — A simple two-state machine tracks the movement:
   - `angle > 160°` → arm is extended, stage = `"down"`
   - `angle < 30°` **and** the previous stage was `"down"` → arm just finished curling, stage = `"up"`, **increment the counter**

   Requiring the `"down"` stage before counting an `"up"` prevents double-counting small wobbles at the top of the curl — a rep only counts once the arm has gone through a full range of motion.
4. **Render** — The skeleton (all 33 landmarks + connective edges) is drawn over the video feed, along with the live rep count, current stage, and angle.

This logic lives in exactly one place per runtime: the notebook's `calculate_angle()` + curl-counter cell, and the web app's [`src/lib/angle.ts`](web/src/lib/angle.ts) + [`src/hooks/useRepCounter.ts`](web/src/hooks/useRepCounter.ts) — the angle formula and stage thresholds are intentionally line-for-line equivalent so behavior stays identical across the two implementations.

One deliberate enhancement in the web app: the notebook only ever reads the *left* arm's landmarks. The web app runs the identical state machine independently for **both arms** (`left`/`right` in `useRepCounter.ts`), each with its own stage and counter, so it works regardless of which arm — or both — you curl with.

## Web App Architecture

The web app is a **fully static, client-side** application — there is no backend and no server ever sees a video frame. This is what makes it deployable as a static site and safe to share as a public link:

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (visitor's machine)                                │
│                                                             │
│   getUserMedia ──▶ <video>                                  │
│                       │                                     │
│                       ▼                                     │
│           MediaPipe PoseLandmarker (WASM, on-device)        │
│                       │                                     │
│                       ▼                                     │
│      33 landmarks ──▶ angle.ts ──▶ useRepCounter state machine │
│                       │                                     │
│                       ▼                                     │
│        <canvas> skeleton overlay + shadcn/ui stats HUD      │
└─────────────────────────────────────────────────────────────┘
```

No frame, landmark, or rep count ever leaves the tab.

### Tech Stack

- **Vite + React + TypeScript** — app shell and build tooling
- **`@mediapipe/tasks-vision`** — MediaPipe's WASM runtime; runs the same Pose model as the Python notebook, entirely in-browser
- **Tailwind CSS + shadcn/ui** — styling and component primitives
- **GSAP** — micro-interactions (rep-count pop animation, landing-page entrance)
- **Vercel** — static hosting/deployment

### Key Implementation Details

| Concern | Where | Notes |
|---|---|---|
| Camera access + permission states | [`hooks/useWebcam.ts`](web/src/hooks/useWebcam.ts) | Exposes `idle / requesting / ready / denied / no-camera / error` so the UI can give explicit feedback — this link gets opened cold by strangers |
| Pose model loading + detection loop | [`hooks/usePoseLandmarker.ts`](web/src/hooks/usePoseLandmarker.ts) | Loads the WASM runtime + a **self-hosted** model asset (`public/models/pose_landmarker_lite.task`), then drives `detectForVideo` off `requestAnimationFrame` |
| Rep-counting state machine | [`hooks/useRepCounter.ts`](web/src/hooks/useRepCounter.ts) | Notebook's angle + stage logic, run independently for left and right arms |
| Skeleton overlay | [`components/tracker/PoseCanvas.tsx`](web/src/components/tracker/PoseCanvas.tsx) | Imperative `draw()` handle so the ~30–60fps loop paints directly to canvas without going through React state on every frame |
| Stats HUD | [`components/tracker/StatsHud.tsx`](web/src/components/tracker/StatsHud.tsx) | shadcn `Card` + GSAP pop animation on each rep increment |

The model asset is self-hosted (rather than fetched from a third-party model host) for reliable, cacheable loads; only the MediaPipe WASM binaries are loaded from jsdelivr's CDN, which is the library's standard distribution channel.

## Repository Structure

```
.
├── mediapipe.ipynb          # Original Python/OpenCV/MediaPipe prototype
├── web/                      # Browser port — React + Vite + MediaPipe WASM
│   ├── public/models/        # Self-hosted MediaPipe Pose Landmarker model
│   └── src/
│       ├── lib/               # calculateAngle(), landmark index constants
│       ├── hooks/              # useWebcam, usePoseLandmarker, useRepCounter
│       └── components/
│           ├── landing/        # Marketing/landing page
│           ├── tracker/        # Camera view, skeleton overlay, stats HUD
│           └── ui/              # shadcn/ui primitives
└── README.md
```

## Running It

### Web app (recommended)

```bash
cd web
npm install
npm run dev
```

Open the printed `localhost` URL, click **Start tracking**, and grant camera access.

To build and preview a production bundle:

```bash
npm run build
npm run preview
```

### Notebook (original prototype)

```bash
pip install mediapipe opencv-python numpy notebook
jupyter notebook mediapipe.ipynb
```

Run the cells in order. The final cell opens your webcam in a window titled "Mediapipe Feed" — perform bicep curls in view of the camera to see the rep counter increment. Press `q` to close the window.

## Deployed Link

**https://web-ten-xi-38.vercel.app**
