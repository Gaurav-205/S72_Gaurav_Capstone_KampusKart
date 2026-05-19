# Deployment and CI/CD

## Hosting

- Frontend: Netlify
- Backend: Render

## Netlify

- Build command: npm run build:verify
- Publish directory: dist (base directory: frontend)
- SPA redirect to /index.html
- Cache headers set for assets, service worker, and manifest
- Production API URLs set in netlify.toml

## Render

- Backend deployed as a Node service
- Uses MONGODB_URI, JWT_SECRET, and other backend env vars

## GitHub Actions

### CI workflow

- Runs on push and PR to main, master, develop
- Frontend lint, test, and build with artifact upload
- Backend lint and tests using a MongoDB service container
- Security audits for frontend and backend dependencies

### CD workflow

- Deploys frontend to Netlify on main and master
- Triggers Render deploy via Render API

### Keep alive workflow

- Scheduled GitHub Action pings /api/health every 14 minutes
