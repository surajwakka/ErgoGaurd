# ErgoGuard AI PWA additions

This patch converts the existing Spring Boot static frontend into an installable Progressive Web App.

## Files to copy into your existing repository
Copy the contents of this patch into the matching locations in your existing project:
- `src/main/resources/static/index.html`
- `src/main/resources/static/app.js`
- `src/main/resources/static/styles.css`
- `src/main/resources/static/manifest.json` (new)
- `src/main/resources/static/service-worker.js` (new)
- `src/main/resources/static/icons/icon-192.png` (new)
- `src/main/resources/static/icons/icon-512.png` (new)

Keep your latest `pom.xml`, `application.properties`, `application-render.properties`, `render.yaml`, Dockerfile and Java files. This patch intentionally contains only frontend PWA files so it does not overwrite your Render database configuration.

## Deploy
Commit and push these files to the same GitHub repository connected to Render. Render will rebuild automatically if auto-deploy is enabled. Open the HTTPS Render URL, refresh once, then use the browser's Install app option. On iPhone, open the site in Safari, tap Share, then Add to Home Screen.

## Offline limitation
The app shell (HTML/CSS/icons) is cached. Live camera pose estimation requires the MediaPipe scripts/model from their CDN and live ergonomic analysis requires the Spring Boot WebSocket connection, so those features still require internet access. This PWA does not cache private camera footage or send/store webcam video.
