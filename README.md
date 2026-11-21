# ErgoGuard AI — Real-Time Ergonomic Posture & Eye-Strain Coach

A Java 21 / Spring Boot application with a browser-based webcam coach, MediaPipe pose landmarks, Spring WebSocket analysis, OpenCV runtime, and a responsive dashboard.

## Features
- Live webcam posture session with browser-side pose landmark extraction.
- Java backend computes shoulder tilt, normalized shoulder span, ergonomic score and coaching feedback over WebSocket.
- Eye-rest timer based on the 20-20-20 rule.
- Session controls, gentle sound alerts and responsive dashboard.
- Camera frames are not recorded or persisted.

## Run locally
Requirements: Java 21, Maven 3.9+, a modern browser, webcam access.

```bash
mvn spring-boot:run
```
Open http://localhost:8080. Camera access is allowed on `localhost` and HTTPS origins. Approve camera permission and select **Start session**.

Health endpoint: `GET /api/health`  
WebSocket endpoint: `/ws/coach`

## Deploy on Render
1. Push this repository to your GitHub account.
2. In Render, choose **New → Blueprint**, connect the repository and let Render read `render.yaml`.
3. Approve creation of the web service and PostgreSQL database.
4. Wait for the Docker build and deployment. Open the generated HTTPS URL and allow camera access.

The included blueprint uses Render's free plans where available; free-instance sleep, database limits, and plan availability are controlled by Render and may change. For a production deployment, select an always-on web plan and a managed PostgreSQL plan.

## Architecture and privacy
MediaPipe runs in the user's browser to derive pose landmarks. Only the selected normalized landmarks and image dimensions are sent to the Spring Boot WebSocket endpoint. The Java service calculates the ergonomic metrics. No webcam video or snapshots are uploaded, stored, or recorded. Shoulder-span proximity is a relative visual heuristic, not a medically calibrated distance measurement.

## Important limitations
This is a wellness aid, not a medical device or diagnostic tool. Webcam posture estimation depends on lighting, camera angle, clothing, visibility and individual anatomy. It does not reliably diagnose spinal posture or eye strain. The initial implementation uses shoulder alignment and relative framing as practical signals; it does not claim a clinically validated slouch classifier or physical screen-distance measurement. The OpenCV runtime is included for future server-side image processing; pose landmarks are currently extracted in the browser to avoid streaming and retaining identifiable video.
