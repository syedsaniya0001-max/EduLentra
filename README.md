# EduLentra College Portal

This repository contains the EduLentra React/Vite college portal and its Express/MongoDB API. The Vercel frontend build is served from the repository root; the active backend is in `src/COLLEGE/backend`.

## Deployment overview

The deployment has three services:

- **Vercel** serves the React app. Set its Root Directory to the folder containing this `package.json`, build command to `npm run build`, and output directory to `dist`.
- **Render** runs the Express API from `src/COLLEGE/backend`. The included `render.yaml` describes the web service and its start command.
- **MongoDB Atlas** stores the portal data. Use the existing database URI and data; do not run any seed script against production.

### 1. Put the full project on GitHub

Connect the GitHub repository that contains this `package.json`, `src`, `public`, `vercel.json`, and `render.yaml`. In the current workspace, `project` is a Git submodule of its parent repository. A parent-repository checkout may contain only a submodule pointer; make sure the deployment provider can access the full project repository, or initialize and expose that submodule before deploying.

Before pushing, review `git status` and stage only files intended for deployment. Never commit `.env`, `.env.*` other than `.env.example`, `node_modules`, or `dist`.

### 2. Connect the existing MongoDB Atlas database

1. In Atlas, select the existing cluster and database. Do not delete, reset, or replace it.
2. Create or use a database user with only the permissions the application needs (normally read/write for the existing application database).
3. In **Network Access**, allow connections from the Render service. Prefer Render's documented outbound IP addresses where available; only use a broad IP rule if necessary and understand that it permits connections from other IPs.
4. Copy Atlas's application connection string and use the existing production database name. Replace its username/password placeholders in Render's secret settings, not in source files. URL-encode special characters in the database password.

### 3. Deploy the API to Render

Create a Render Blueprint from the GitHub project repository and use `render.yaml`. The service root is `src/COLLEGE/backend`; Render runs `npm ci` and `npm start`. If configuring a Web Service manually, use that same root directory, build command, and start command.

Set these Render environment variables:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` (set by the Blueprint) |
| `MONGODB_URI` | The existing Atlas connection string; keep it private |
| `JWT_SECRET` | A new private random value of at least 32 characters |
| `FRONTEND_BASE_URL` | The exact Vercel origin, such as `https://your-project.vercel.app` |
| `PORT` | Do not set manually; Render supplies it |

`CORS_ORIGINS` is optional. Set it to comma-separated additional frontend origins only if you use other Vercel preview/custom domains. Password-reset emails are optional; to enable them, also set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. Without working SMTP settings, login and the other portal features still run, but password-reset email requests report that email is not configured.

After the first deploy, copy the public Render service URL (for example, `https://<your-service>.onrender.com`) from the Render dashboard. Opening its root URL should return `{"message":"EduLentra Backend is running"}`.

### 4. Deploy the frontend to Vercel

Import the same full project repository in Vercel. Set the Root Directory to the folder containing this `package.json`, then add this environment variable for Production (and Preview if needed):

| Name | Value |
| --- | --- |
| `VITE_API_BASE_URL` | The public Render service URL, with no trailing slash |

Deploy and copy the public Vercel deployment URL from the Vercel dashboard. The app is configured for the domain root; Vercel rewrites application routes to the React entry page.

### 5. Finish CORS and test the live demo

1. In Render, set `FRONTEND_BASE_URL` to the exact Vercel origin (no route suffix), then redeploy the API.
2. In Vercel, confirm `VITE_API_BASE_URL` is the exact Render URL, then redeploy the frontend.
3. Open the Render root URL and confirm its health response.
4. Open the Vercel URL, visit the public pages, and sign in with an existing approved account. Do not use sample accounts unless they already exist in the database.
5. Test role dashboards and database-backed flows (for example, announcements, assignments, attendance, and profile changes) with accounts and records you are authorized to use. Verify saved changes remain after a refresh.
6. If a browser request fails, check the browser Network/Console tabs and Render logs. Confirm both public URLs and the two URL environment variables match exactly.

## Local development and checks

Copy `.env.example` to `.env` in the frontend project directory and keep `VITE_API_BASE_URL=http://localhost:5000` for local work. Copy `src/COLLEGE/backend/.env.example` to `src/COLLEGE/backend/.env`, then set a local MongoDB URI, a private 32+ character JWT secret, and `FRONTEND_BASE_URL=http://localhost:5173`. `.env` files are ignored by Git.

Run the API from `src/COLLEGE/backend` with `npm start`; run the frontend from this repository directory with `npm run dev`. The production frontend needs `VITE_API_BASE_URL` set to the deployed API URL.

The backend's sample seeding script is for a dedicated test database only. Never run it in production.

Run the available checks from the project root:

```powershell
npm test
npm run build
Set-Location src/COLLEGE/backend
npm test
```
