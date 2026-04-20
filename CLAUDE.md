# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Single-page app for generating commercial proposals (propuestas comerciales) for QNA Medical S.A.S., a Colombian medical device distributor.

**App flow — two modes managed by `AppShell`:**
- **Single mode**: 3-step wizard — Step 1: client info form (`ProposalForm`), Step 2: product selection with pricing (`ProductsTable`), Step 3: PDF preview and export (`ProposalPreview`)
- **Batch mode**: bulk proposal generation from an Excel template (`BatchMode`)

**Key domain concepts:**
- `ClientType`: `"ips"` (hospitals/clinics) vs `"distribuidor"` (distributors) — determines which price list to use
- `PaymentTermsKey`: `"30" | "60" | "90" | "contado"` — payment terms added to proposals
- Prices live in `lib/prices.ts` as two static arrays (`PRODUCTS_IPS`, `PRODUCTS_DIST`); `getProducts(clientType)` selects the right one
- Discounts are applied as a percentage on top of the base price list

**Output generation:**
- PDF: `lib/pdf-generator.ts` using jsPDF + jspdf-autotable
- Excel batch template: `lib/batch-template.ts` using xlsx + sheetjs-style

**Path alias:** `@/` maps to the project root (not `src/`). Files live at `app/`, `components/`, `lib/` — no `src/` wrapper.

**Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`. No `tailwind.config.*` file — v4 uses CSS-first config.

## Rules
- Do NOT create AGENTS.md
- Do NOT read files inside node_modules/
- Do NOT add @AGENTS.md reference to this file