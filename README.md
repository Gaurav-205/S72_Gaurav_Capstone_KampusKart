<div align="center">
  <img src="frontend/public/Logo.png" alt="KampusKart Logo" width="100" />

  # KampusKart

  All-in-one campus portal for MIT ADT University

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-kampuskart.netlify.app-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://kampuskart.netlify.app)
  [![CI](https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart/actions/workflows/ci.yml/badge.svg)](https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart/actions/)
  [![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)
  [![Node](https://img.shields.io/badge/Node.js-%3E%3D16-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)

</div>

---

**Note:** This repository is owned by the Gaurav. If you maintain a personal profile README (for example, `Gaurav-205`), please pin a link to this project and add the short blurb in [docs/profile_readme_snippet.md](docs/profile_readme_snippet.md) so visitors can find the project quickly.


## Overview

KampusKart is a full-stack campus management portal built for MIT ADT University. Students and faculty can navigate the campus, stay updated on news and events, report lost items, submit complaints, chat in real time, and browse club recruitments — all in one place.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Local Setup](#local-setup)
- [Environment Variables Reference](#environment-variables-reference)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [NPM Scripts](#npm-scripts)
- [CI/CD](#cicd)
- [Google OAuth Setup](#google-oauth-setup)
- [Admin Access](#admin-access)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)
- [Project Docs](#project-docs)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Module | Description |
|--------|-------------|
| Campus Map | Google Maps integration with facility markers and location search |
| News | Rich media news posts with admin management |
| Events | Event listings with registration links, dates, and location details |
| Lost & Found | Report and search lost/found items with image uploads; auto-expires after 14 days |
| Complaints | Submit complaints with category, priority, and department; track status history |
| Facilities | Directory with type, hours, contact info, and images |
| Clubs Recruitment | Listings with deadlines, application form links, and contact info |
| Global Chat | Real-time messaging with emoji reactions, replies, read receipts, and file attachments |
| Authentication | Email/password + Google OAuth, JWT sessions, OTP-based password reset |
| User Profiles | Profile picture, major, year of study, program, gender, date of birth |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript 5, Vite 6, Tailwind CSS 3, Material UI 7, Framer Motion, Socket.IO Client |
| Backend | Node.js 18 (CommonJS), Express 5, MongoDB, Mongoose, JWT, Passport.js, Socket.IO, Cloudinary, Nodemailer |
| Infrastructure | Netlify (frontend), Render (backend), MongoDB Atlas, GitHub Actions |
| Testing | Vitest + React Testing Library (frontend), Jest + Supertest (backend) |

---

## Screenshots

> Screenshots below are representative. The live app at [kampuskart.netlify.app](https://kampuskart.netlify.app) reflects the current state.

| Campus Map | Global Chat | Lost & Found |
|:---:|:---:|:---:|
| ![Map](frontend/public/images/3.png) | ![Chat](frontend/public/images/1.png) | ![Lost & Found](frontend/public/images/2.png) |

Additional pages — Events, News, Facilities, Clubs Recruitment, Complaints, and Profile — are accessible after login. All feature the same card-grid layout with search, filters, illustrated empty states, and full mobile responsiveness.

---

## Quick Start

If you already have MongoDB, Cloudinary, and Google OAuth credentials ready, this is the fastest path:

```bash
git clone https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart.git
cd S72_Gaurav_Capstone_KampusKart

cd frontend && npm install
cd ../backend && npm install

cp backend/.env.example backend/.env
cp frontend/.env.development frontend/.env

# Run in 2 terminals:
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open frontend at `http://localhost:5173`.

---

## Local Setup

### Prerequisites

- Node.js >= 16
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- Cloudinary account
- Google Cloud project with OAuth 2.0 credentials
- Gmail account (for email/OTP features)

### 1. Clone and install

```bash
git clone https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart.git
cd S72_Gaurav_Capstone_KampusKart

cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

**Backend** — copy and fill in `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kampuskart
JWT_SECRET=your_jwt_secret_minimum_32_characters

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
ADMIN_EMAILS=admin@example.com

# Optional: comma-separated list of additional allowed CORS origins
ALLOWED_ORIGINS=https://your-frontend.netlify.app
```

**Frontend** — copy and fill in `frontend/.env`:

```bash
cp frontend/.env.development frontend/.env
```

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=KampusKart
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend runs at `http://localhost:5173`, API at `http://localhost:5000`.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | Yes | Backend HTTP port |
| `NODE_ENV` | Yes | Runtime mode (`development`/`production`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (use 32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `EMAIL_SERVICE` | Yes | Email provider (for OTP/reset) |
| `EMAIL_USER` | Yes | Sender email account |
| `EMAIL_PASS` | Yes | App password/token for email account |
| `FRONTEND_URL` | Yes | Primary frontend URL for CORS and redirects |
| `BACKEND_URL` | Yes | Public backend URL |
| `ADMIN_EMAILS` | Yes | Comma-separated admin emails |
| `ALLOWED_ORIGINS` | Recommended | Extra allowed CORS origins |
| `RENDER_EXTERNAL_URL` | Optional | Used by keep-alive/uptime scripts |
| `SERVER_URL` | Optional | Used by keep-alive/uptime scripts |
| `SEED_USER_EMAIL` | Optional | Seed script helper value |

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | Yes | Base URL for REST API |
| `VITE_SOCKET_URL` | Yes | Socket.IO server URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes (uploads) | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes (uploads) | Cloudinary unsigned upload preset |

---

## Project Structure

```
KampusKart/
├── frontend/                   # React + TypeScript (Vite)
│   ├── public/                 # Static assets and images
│   └── src/
│       ├── components/         # Feature and UI components
│       │   ├── Chat/           # Real-time chat window
│       │   ├── common/         # Shared UI components
│       │   └── ui/             # Shadcn/Radix UI primitives
│       ├── contexts/           # Auth context (JWT + Google OAuth)
│       ├── hooks/              # Custom React hooks
│       └── utils/              # Helper utilities
├── backend/                    # Node.js + Express
│   ├── config/                 # Passport.js, Cloudinary setup
│   ├── cron/                   # Scheduled jobs (cleanup, keep-alive)
│   ├── middleware/             # Auth (JWT), input validation
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # REST API route handlers
│   ├── scripts/                # Seed data, uptime monitoring
│   ├── tests/                  # Jest test suites
│   └── utils/                  # Email utilities
└── .github/
    └── workflows/              # CI, CD, keep-alive pipelines
```

---

## API Routes

| Prefix | Routes |
|--------|--------|
| `/api/auth` | `POST /signup`, `POST /login`, `GET /google`, `GET /google/callback`, `POST /forgot-password`, `POST /reset-password`, `POST /refresh` |
| `/api/user` | `GET /profile`, `PUT /profile` |
| `/api/profile` | `GET /`, `PUT /` (with profile picture upload) |
| `/api/lostfound` | CRUD + resolve, admin restore/permanent-delete/cleanup |
| `/api/complaints` | CRUD + status history, admin restore/permanent-delete/cleanup |
| `/api/news` | `GET /` (public), admin `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/events` | `GET /` (public), admin `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/facilities` | `GET /` (public), admin `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/clubs` | `GET /` (public), admin `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/chat` | `GET /messages`, `POST /messages`, edit, delete, reactions, read receipts, search |
| `/api/health` | Server health and readiness status |

---

## NPM Scripts

### Frontend (`frontend/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `vite` | Start development server |
| `npm run build` | `vite build` | Production build |
| `npm run build:verify` | `vite build && node verify-assets.js` | Build and validate generated assets |
| `npm run verify-build` | `node verify-build.js` | Post-build integrity checks |
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run lint` | `eslint .` | Lint frontend source |
| `npm test` | `vitest run` | Run test suite once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |

### Backend (`backend/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `nodemon server.js` | Start backend in development mode |
| `npm start` | `node server.js` | Start backend in production mode |
| `npm run lint` | `eslint .` | Lint backend source |
| `npm test` | `jest` | Run backend tests |
| `npm run seed` | `node scripts/seedData.js` | Seed initial or sample data |
| `npm run setup-uptime` | `node scripts/setup-uptime-monitoring.js` | Configure uptime monitoring helpers |
| `npm run test-keep-alive` | `node scripts/test-keep-alive.js` | Validate keep-alive behavior |

---

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push / PR to `main`, `develop` | Lint, build, test, security audit |
| `cd.yml` | Push to `main` | Deploy frontend to Netlify, trigger Render deploy |
| `keep-alive.yml` | Every 14 minutes | Ping backend to prevent Render cold starts |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for frontend build |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Netlify site ID |
| `RENDER_API_KEY` | Render API key |
| `RENDER_SERVICE_ID` | Render backend service ID |
| `BACKEND_URL` | Full backend URL for keep-alive ping |

---

## Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google+ API**
3. Create **OAuth 2.0 credentials** (Web application type)
4. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend.onrender.com/api/auth/google/callback`
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BACKEND_URL` in `backend/.env`

---

## Admin Access

Admin privileges are granted by email. Add admin email addresses to `ADMIN_EMAILS` in `backend/.env` (comma-separated). Admins can:

- Create, edit, and delete News, Events, Facilities, and Club Recruitments
- View and manage all Complaints and Lost & Found items (including soft-deleted)
- Permanently delete or restore soft-deleted records
- Trigger manual cleanup of expired items

---

## Running Tests

```bash
# Frontend (Vitest)
cd frontend && npm test

# Backend (Jest)
cd backend && npm test
```

Frontend tests cover utility functions (`formValidation`) and shared UI components. Backend tests cover auth middleware, input validation, Mongoose models, route handlers, and email utilities.

> **Note on language breakdown:** GitHub reports ~60% TypeScript / ~37% JavaScript for this repo. This is expected — the frontend is 100% TypeScript, while the backend is intentionally plain CommonJS JavaScript (no transpilation step, direct Node.js execution). The JS percentage reflects the backend, not untyped frontend code.

---

## Troubleshooting

### App starts but API calls fail

- Confirm `VITE_API_URL` in `frontend/.env` points to running backend URL.
- Confirm backend is listening on `PORT` and `BACKEND_URL` is correct.
- Verify CORS values: `FRONTEND_URL` and `ALLOWED_ORIGINS` in `backend/.env`.

### Google login not working

- Verify callback URI in Google Cloud exactly matches your backend route.
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are from the same OAuth app.
- Confirm frontend and backend URLs are both added where required in Google settings.

### Image uploads fail

- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in backend.
- Check `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in frontend.
- Ensure the Cloudinary preset supports unsigned uploads if used client-side.

### OTP email not delivered

- Use an app password (not account password) for Gmail.
- Verify `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` values.
- Check spam folder and email provider rate limits.

---

## Project Docs

- [UI_UX_STANDARDS.md](UI_UX_STANDARDS.md) for frontend design and component consistency standards.
- [SECURITY.md](SECURITY.md) for vulnerability reporting and security practices.
- [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) for cleanup work and maintenance notes.

---

## Contributing

External contributions are currently by approval. Open a discussion first to propose changes or features:

- GitHub Discussions: [Project Discussions](https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart/discussions)
- GitHub Issues: [Issue Tracker](https://github.com/kalviumcommunity/S72_Gaurav_Capstone_KampusKart/issues)

---

## License

All Rights Reserved — see [LICENSE](LICENSE)

This project is proprietary software. Unauthorized copying, distribution, or use is strictly prohibited.

---

<div align="center">
  Made by <a href="https://github.com/Gaurav-205">Gaurav Khandelwal</a>
</div>
