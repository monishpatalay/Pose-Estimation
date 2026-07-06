# Pose Estimation — Bicep Curl Counter

A real-time webcam exercise-rep counter built with MediaPipe Pose and OpenCV. It detects body landmarks, computes the elbow joint angle (shoulder–elbow–wrist), and counts bicep curl repetitions by tracking the arm's transition between "down" and "up" stages.

## How it works

1. Captures webcam frames with OpenCV
2. Runs MediaPipe's Pose model to extract 33 body landmarks per frame
3. Computes the angle at the elbow using `arctan2` on the shoulder, elbow, and wrist coordinates
4. Tracks a `stage` ("up"/"down") and increments a `counter` each time a full curl is completed
5. Draws the pose skeleton and rep counter overlay on the live video feed

## Tech Stack

Python, [MediaPipe](https://developers.google.com/mediapipe) (Pose solution), OpenCV, NumPy — all run inside a Jupyter Notebook (`mediapipe.ipynb`).

## Running It

```bash
pip install mediapipe opencv-python numpy notebook
jupyter notebook mediapipe.ipynb
```

Run the cells in order. The final cell opens your webcam in a window titled "Mediapipe Feed" — perform bicep curls in view of the camera to see the rep counter increment. Press `q` to close the window.

## Deployed Link

Not applicable — this is a local, webcam-driven notebook rather than a hosted web app.
