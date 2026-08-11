AR Business — Digital Store

Starter scaffold created by GitHub Copilot (assistant).

Stack:
- React + Vite + TypeScript
- TailwindCSS (minimal)
- Supabase client config
- Prisma schema

Files added:
- package.json, vite.config.ts, netlify.toml
- prisma/schema.prisma
- src/ (app, pages, components, services, styles)
- .env.example

Notes:
- Replace env values in .env with your Supabase keys and DATABASE_URL.
- Run `npm install` then `npm run dev`.
- Prisma client generation requires a valid DATABASE_URL.

How to run locally
1. Install dependencies:
   - `npm install`
2. Provide env values (create `.env` from `.env.example`) and set:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`
3. (Optional, for Prisma) Generate client:
   - `npm run prisma:generate` (requires valid `DATABASE_URL`)
4. Start dev server:
   - `npm run dev`

Notes / caveats
- Tailwind is referenced but you should run `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js` if you want to customize further. A minimal `tailwind.config.cjs` and `postcss.config.cjs` are included.
- Prisma schema is included; adapt models to match your Supabase table names and migrations if you plan to use Prisma with Supabase.
- Supabase table names in `src/services/products.ts` use lowercase table names (`products`, `ads`) — adjust to your actual DB table names/casing if needed.
- Admin route is a placeholder; next step is to add Supabase Auth guard, RLS guidance, and file upload flows (signed URLs).

