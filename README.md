# Virtual_HMI

## Overview

Virtual_HMI is a web-based HMI (Human-Machine Interface) frontend built with Vite, React and Tailwind CSS. It includes UI components from shadcn-ui and Radix, integrates with Supabase for backend data, and communicates with an OPC UA middleware (Node.js) for PLC data.

## Quick Start

Prerequisites:
- Node.js 18+ (or compatible)
- npm (or pnpm/yarn)

Install and run in development:

```bash
git clone <YOUR_REPO_URL>
cd Virtual_HMI
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview   # serves the built `dist` locally
```

There is also a `start` script that runs `npm run build` and serves `dist` using `serve`.

## Environment / Configuration

- Frontend environment variables should be prefixed with `VITE_`.
- Common variables used by this project (create a `.env` file at the project root):
  - `VITE_MIDDLEWARE_URL` — URL of the OPC UA middleware (default `http://localhost:5000`)
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — required if Supabase features are used

See `src/lib/supabaseClient.ts` for Supabase client usage.

## Project Structure (selected)

- `src/` — application source code
  - `components/` — shared UI components and HMI pages
  - `hooks/` — custom React hooks (e.g., `useHmiData.ts`)
  - `lib/` — small libraries (e.g., `supabaseClient.ts`, `utils.ts`)
  - `pages/` — top-level route pages
  - `main.tsx`, `App.tsx` — app entry
- `public/` — static assets
- `Server OPC UA.js` — example Node.js middleware for OPC UA (middleware server)

## Used Technologies (details)

- Vite — fast build tool and dev server used to bootstrap and serve the app.
- React 18 — UI library used for building components and pages.
- TypeScript — static typing for safer, self-documenting code.
- Tailwind CSS — utility-first CSS framework for styling.
- shadcn-ui & Radix UI — component primitives and design system utilities used by components in `src/components/ui`.
- Supabase (`@supabase/supabase-js`) — used for backend database/auth (client is in `src/lib/supabaseClient.ts`).
- React Router (`react-router-dom`) — client-side routing.
- React Query (`@tanstack/react-query`) — server-state fetching, caching and polling (useful for periodic PLC/middleware reads).
- Recharts — charting library for statistics and graphs.
- Zod — schema validation for inputs and API payloads.
- react-hook-form — form handling.
- Sonner — toast notifications.
- Tailwind plugins: `@tailwindcss/typography`, `tailwindcss-animate` for enhanced styles and animations.

Dev tools:
- ESLint — linting rules
- TypeScript compiler — type checking
- Vite plugin React SWC — fast JSX/TSX compilation

## Middleware (OPC UA)

This frontend expects an OPC UA middleware that exposes simple HTTP endpoints (for example `/read` and `/write`). A middleware example is included as `Server OPC UA.js` — start it and set `VITE_MIDDLEWARE_URL` to the printed URL.

## Scripts

- `npm run dev` — development server (Vite)
- `npm run build` — production build
- `npm run preview` — preview built output
- `npm run start` — build and serve `dist` (requires `serve`)
- `npm run lint` — run ESLint

## Contributing

- Fork the repository and open a pull request.
- Follow existing code conventions (TypeScript + React + Tailwind).
- Run `npm install` and `npm run dev` to test changes locally.

If you plan to add features that need backend keys (Supabase), do not commit secrets — use environment variables and a secret manager.

## Troubleshooting

- CORS errors when connecting to middleware: ensure `VITE_MIDDLEWARE_URL` matches the middleware origin and that the middleware has CORS enabled.
- If data polling does not appear, check React Query polling settings in `useHmiData.ts`.

## License

This repository does not include a license file. Add a `LICENSE` file (for example MIT) if you want to open-source this project.

---

If you want, I can also:
- Add a small example `.env.example` file
- Add a `LICENSE` (MIT)
- Commit and push the README update for you
