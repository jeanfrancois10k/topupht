<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GAME TOP-UP HAITI - Agent Instructions

## Project Overview
Game Top-Up is a professional game recharge platform for Haiti, built with Next.js 16, React 19, Supabase, and Tailwind CSS 4.

## Key Architecture Decisions

### TypeScript Handling
- `tsconfig.json` has `strict: false` to accommodate Supabase type inference issues
- Many files use `// @ts-nocheck` or `as any` casts due to Supabase `.insert()`, `.rpc()`, and `.single()` returning `never` types without generated types
- Run `npx supabase gen types typescript --project-id <project-id> --schema public` to generate proper types when Supabase is configured
- The `WalletIcon` from lucide-react is a React component (value), NOT a type — never use it in type annotations

### Build Requirements
- Build requires `.env.local` with valid Supabase URL and key placeholders (not "your-supabase-..." placeholders)
- The `config/supabase.ts` uses safe defaults with warnings instead of throwing when env vars are missing
- Build command: `npx next build`
- Typecheck command: `npx tsc --noEmit`

### Supabase Type Issues
- `.insert()` returns `never[]` - cast with `as any`
- `.rpc()` function calls need `(supabaseClient.rpc as any)(...)` syntax
- `.single()` returns type issues - cast result with `as any`
- `.from().select()` on tables with RLS needs `as any` in some cases
- These will be fixed properly when `@supabase/gen` types are generated

### Next.js 16 App Router
- `Link` is imported from `next/link` (not `next/link` default export)
- `page.tsx` files are React Server Components by default
- Use `"use client"` directive for client-side components
- `metadataBase` in `page.tsx` requires `NEXT_PUBLIC_PLATFORM_URL` to be set

### File Structure
- `/app/` - Next.js pages
- `/components/ui/` - Shadcn-style UI components
- `/components/layout/` - Layout components
- `/components/features/` - Feature-specific components
- `/features/` - Business logic modules
- `/lib/` - Utilities and helpers
- `/services/` - External service integrations
- `/hooks/` - Custom React hooks
- `/stores/` - Zustand state management
- `/config/` - Configuration files
- `/types/` - TypeScript type definitions
- `/migrations/` - PostgreSQL migrations
- `/seeds/` - Seed data
- `/tests/` - Test files

### Database
- All tables use UUID primary keys
- Financial data uses TEXT columns (not FLOAT) for precision
- RLS is enabled on all tables
- Ledger system: all financial operations recorded in `wallet_transactions`
- No physical deletes on financial tables

### Icons
- lucide-react v0.400+ naming: `Wallet` not `WalletIcon`, `Gamepad2` not `Gamepad`, etc.
- Check exact icon names before importing

## Build Verification
After any changes, run `npx next build` to verify the build passes.
Target: 0 TypeScript errors.

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run typecheck` - Run TypeScript check

## Documentation
- `README.md` - Project overview and setup instructions
- `ARCHITECTURE.md` - Detailed architecture documentation
- `DATABASE.md` - Database schema and ledger system documentation