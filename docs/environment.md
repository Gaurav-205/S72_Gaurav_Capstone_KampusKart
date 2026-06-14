# Environment Configuration

This document lists the environment variables used by the backend and frontend.

## Backend (.env)
Required for production:
- JWT_SECRET
- MONGODB_URI

Required for full feature set:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- EMAIL_USER
- EMAIL_PASS

Optional:
- EMAIL_SERVICE (example: gmail)
- ADMIN_EMAILS (comma separated list)
- ALLOWED_ORIGINS (comma separated list)
- FRONTEND_URL (used for Google OAuth redirect)
- BACKEND_URL (used for Google OAuth callback)
- RENDER_EXTERNAL_URL (used by keep alive)
- SERVER_URL (override keep alive target)
- ENABLE_KEEP_ALIVE (true to force internal keep alive)
- PORT (default 5000)
- NODE_ENV (development or production)
- CI (true in CI to relax env validation)

Example backend .env
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kampuskart
JWT_SECRET=change-me
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
ADMIN_EMAILS=admin1@example.com,admin2@example.com
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
ENABLE_KEEP_ALIVE=false
```

## Frontend (.env)
Required in development:
- VITE_GOOGLE_MAPS_API_KEY

Optional:
- VITE_API_URL (defaults to localhost in dev, Render in prod)
- VITE_SOCKET_URL (defaults to localhost in dev, Render in prod)

Example frontend .env
```
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Netlify build environment
Netlify sets build env vars in netlify.toml:
- VITE_API_URL
- VITE_SOCKET_URL
- NODE_VERSION
