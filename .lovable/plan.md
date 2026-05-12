# Convert StockNova to Vite + React SPA (Netlify-ready)

Convert the project from TanStack Start (SSR) to a plain **Vite + React + React Router + Tailwind CSS** SPA so `npm run build` produces a static `dist/` folder with `index.html` that deploys directly to Netlify.

## New folder structure

```
src/
  pages/
    Index.tsx          -> "/" (landing / redirect to dashboard if logged in)
    Auth.tsx           -> "/auth" (login + first-run setup combined)
    Dashboard.tsx      -> "/dashboard"
    Items.tsx          -> "/items"
    Suppliers.tsx      -> "/suppliers"
    Reports.tsx        -> "/reports"
    Users.tsx          -> "/users"
    NotFound.tsx       -> catch-all 404
  components/
    AppSidebar.tsx     (kept, navigation switched to react-router-dom Link)
    ProtectedRoute.tsx (new, wraps authenticated pages)
    AppLayout.tsx      (new, sidebar + <Outlet/>)
    ui/                (shadcn unchanged)
  lib/
    firebase.ts        (unchanged)
    auth-context.tsx   (unchanged logic, no SSR concerns)
    db/                (unchanged)
    pdf.ts             (unchanged)
    utils.ts
  App.tsx              (router + providers)
  main.tsx             (ReactDOM.createRoot)
  index.css            (Tailwind directives + tokens)
index.html             (Vite entry at project root)
```

Note: the existing app has Categories, Stock Movement, Settings routes too. To match the screenshot's `pages/` list exactly, those will be **merged**: Categories merged into Items page (tab), Stock Movement merged into Items page (tab/dialog), Settings merged into Users page. If you want them as separate pages, say so and I'll keep them.

## Stack changes

**Remove:**
- `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`
- `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config`
- `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/routeTree.gen.ts`, `wrangler.jsonc`

**Add:**
- `react-router-dom@^6`
- Standard `vite.config.ts` with `@vitejs/plugin-react` + `@tailwindcss/vite` + path alias `@`
- Root-level `index.html` (Vite entry)
- `public/_redirects` containing `/* /index.html 200` (Netlify SPA fallback)
- `netlify.toml` with build command and publish dir

**Keep:**
- Tailwind v4 setup via `@tailwindcss/vite` + `src/index.css` with `@import "tailwindcss"` and existing OKLCH design tokens
- All shadcn UI components in `src/components/ui/`
- Firebase config + all data hooks + PDF generation logic
- Existing page logic (just relocated and rewired to react-router-dom)

## Routing rewrite

- `<BrowserRouter>` in `App.tsx` with `<Routes>`
- `useNavigate()` replaces TanStack `Route.useNavigate()`
- `<Link to="...">` from `react-router-dom`
- `useParams()` from `react-router-dom`
- `<ProtectedRoute>` checks `useAuth()` and redirects to `/auth` when no user; admin-only pages additionally check role

## Build & deploy

- `npm run build` → outputs `dist/index.html` + assets
- `netlify.toml`:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"
  ```
- `public/_redirects` ensures deep links (e.g. `/items`) work after refresh on Netlify.

## Implementation steps

1. Update `package.json`: remove TanStack/Cloudflare deps, add `react-router-dom`
2. Replace `vite.config.ts` with plain Vite config (React + Tailwind + alias)
3. Create root `index.html` and `src/main.tsx`
4. Create `src/App.tsx` with Router + AuthProvider + QueryClient + Toaster + Routes
5. Create `src/components/ProtectedRoute.tsx` and `src/components/AppLayout.tsx`
6. Migrate each route file under `src/routes/` to a corresponding `src/pages/*.tsx`, swapping all TanStack imports for `react-router-dom`
7. Delete `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/routeTree.gen.ts`, `wrangler.jsonc`, `bun.lock`
8. Add `public/_redirects` and `netlify.toml`
9. Run install + build to verify `dist/index.html` is generated cleanly

## What I need confirmed

1. Are you OK with merging **Categories → Items**, **Stock Movement → Items**, and **Settings → Users** to match the exact `pages/` list in your screenshot? (Reply "keep separate" if you want all original pages.)
2. The Lovable in-editor preview is built around TanStack Start. After this conversion, the Lovable preview will still work (Vite SPA renders fine), but some Lovable-specific tooling tied to TanStack Start may behave differently. Local `npm run dev` and Netlify deployment will work normally.
