# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## EduLentra announcements

Announcements are stored by the Express/MongoDB service in `src/COLLEGE/backend`. Set `MONGODB_URI` and `JWT_SECRET` in `src/COLLEGE/backend/.env`, then start that service with:

```powershell
cd src/COLLEGE/backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Set MONGODB_URI and JWT_SECRET in .env before starting the server.
npm start
```

Keep `.env` files local; commit only the `.env.example` templates.

In a separate terminal, start the frontend from the project root. For local development, the API defaults to `http://localhost:5000`; copy `.env.example` to `.env` and set `VITE_API_BASE_URL` there when using a different backend URL.

```powershell
cd <project-root>
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

The backend authenticates announcement WebSocket connections with the same bearer JWT used by the REST API. Announcement changes invalidate connected clients' feeds; clients reload the server-filtered feed and also refresh once per minute so scheduled and expired announcements are re-evaluated in open dashboards. Deploy the updated backend before expecting WebSocket pushes from a production API host.

Run the frontend role-flow tests, backend tests, and production build with:

```powershell
npm test
npm test --prefix src/COLLEGE/backend
npm run build
```
