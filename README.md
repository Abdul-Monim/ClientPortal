# ClientPortal — Lightweight White-Label Client Hub for Freelancers

ClientPortal replaces unstructured client email threads with a calm, password-protected, white-labeled client hub. Freelance developers and designers manage projects, weighted milestones, versioned deliverables, formal client sign-offs, and invoices from a single Studio Workbench while clients access a branded portal tailored to the studio's logo, color palette, and optional custom domain.

---

## Key Capabilities

- **White-Label Studio Identity**: Configure studio name, URL slug, custom domain (`client.yourname.com`), logo URL, WCAG contrast-verified brand accent color, welcome banner, and invoice billing address.
- **Hybrid Multi-Tenant Routing**: Next.js middleware resolves both custom domains / studio subdomains (`client.yourname.com`, `[studio].localhost:3000`) and zero-config branded links (`/p/[studio]/[project]`).
- **Password-Protected Client Portals**: Per-project passcodes hashed with `scrypt`, verified with `timingSafeEqual`, protected by a sliding-window rate limiter, and bound to `HttpOnly` HMAC-SHA256 session cookies. Rotating a password immediately revokes prior guest sessions.
- **Weighted Milestone Roadmap**: Assign percentage weights to project phases so clients always see accurate real-time completion progress.
- **Versioned Deliverables & Formal Approvals**: Combine direct Cloudinary file uploads with external design and staging links (Figma, Vercel, Loom, PDFs, images). Track `v1 -> v2 -> v3` revisions, host contextual feedback threads, and capture immutable client sign-off records (`Approved` / `Changes Requested`).
- **Hybrid Stripe Invoicing & Branded PDF Engine**: All financial calculations use exact integer cents (`subtotal_cents`, `tax_bps`, `total_cents`). Integrates with Stripe Invoicing + verified webhooks (`invoice.paid`) while generating native white-labeled PDF invoices downloadable directly inside the client portal.
- **Dual-Adapter Runtime**: Boots immediately in **Interactive Studio Sandbox Mode** with realistic demo data when cloud credentials are omitted, and seamlessly switches to live **Supabase PostgreSQL + RLS**, **Cloudinary**, and **Stripe** once `.env.local` is configured.

---

## Architecture Overview

```text
src/
  domain/               Pure business logic (integer-cents money, weighted milestones, FSMs, Zod schemas, WCAG contrast)
  infrastructure/
    config/             Runtime mode and environment detection
    security/           scrypt passcodes, HMAC session cookies, sliding-window rate limiter
    repositories/       PortalRepository contract + Supabase PostgreSQL adapter + Interactive Sandbox adapter
    media/              Cloudinary signed direct-upload signature generator
    billing/            Stripe Invoicing + webhook verification + pdf-lib white-label PDF generator
  services/             Freelancer Server Actions and session auth helpers
  components/           Editorial Atelier UI primitives, Studio Workbench, and Client Portal Hub
  app/                  Next.js 15 App Router pages and API Route Handlers
supabase/migrations/    PostgreSQL DDL, constraints, indexes, and Row-Level Security policies
tests/                  Vitest unit, invariant, security, and PDF verification suites
```

---

## Quick Start (Local Sandbox Mode)

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`:
- **Studio Workbench**: `http://localhost:3000/dashboard`
- **Live Branded Client Portal**: `http://localhost:3000/p/atelier-vance/meridian-rebrand` (Demo password: `meridian2026`)

---

## Connecting Live Cloud Services ($0.00/mo Free Tiers)

Copy `.env.example` to `.env.local` and supply credentials as needed:

1. **Supabase (PostgreSQL + Auth + RLS)**
   - Create a free project at `supabase.com`.
   - Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor.
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Cloudinary (Direct Signed File Uploads)**
   - Create a free account at `cloudinary.com`.
   - Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. **Stripe Invoicing (Online Payment Links & Webhooks)**
   - Create a Stripe account and enable Test Mode.
   - Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
   - Point a webhook endpoint to `https://your-domain.com/api/webhooks/stripe` listening for `invoice.paid`.
4. **Vercel Deployment & Custom Domains**
   - Import the repository to Vercel Hobby tier and add the environment variables above.
   - For custom client domains (`client.yourname.com`), add a CNAME record pointing to `cname.vercel-dns.com` and enter the hostname in **Dashboard -> Branding**.

---

## Verification Commands

```bash
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm build
```
