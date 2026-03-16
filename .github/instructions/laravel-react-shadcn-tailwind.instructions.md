---
description: "Use when building or editing Inertia React UI, shadcn components, or Tailwind styling tied to Laravel routes and data flow. Covers Wayfinder usage, component reuse, and Tailwind v4 conventions."
name: "Laravel React UI Conventions"
applyTo:
  - "resources/js/**/*.ts"
  - "resources/js/**/*.tsx"
  - "resources/css/**/*.css"
  - "app/Http/Controllers/**/*.php"
  - "app/Http/Requests/**/*.php"
  - "routes/**/*.php"
---

# Laravel + Inertia React + shadcn + Tailwind Conventions

## Stack Alignment

- Keep server rendering through Inertia pages in `resources/js/pages` and do not introduce standalone SPA routing.
- Use generated route helpers from Wayfinder (`@/actions` and `@/routes`) instead of hardcoded URL strings.
- Reuse existing UI primitives from `resources/js/components/ui` before adding new component variants.

## React + Inertia Patterns

- Use existing app layout patterns from sibling pages in `resources/js/pages`.
- Keep page-level concerns in page files and shared UI in `resources/js/components`.
- For forms, follow existing Inertia form conventions and match validation/error handling patterns already used in settings and auth pages.
- Build layouts mobile-first and scale up for larger breakpoints.

## shadcn Component Usage

- Use the shared `cn()` helper from `resources/js/lib/utils.ts` for conditional classes.
- Compose with existing shadcn components instead of rebuilding controls with raw markup.
- Keep new component APIs small and consistent with existing `resources/js/components/ui` prop shapes.

## Tailwind v4 Styling

- Follow the token and variable conventions defined in `resources/css/app.css`.
- Prefer utility classes and existing design tokens instead of introducing one-off inline styles.
- Keep class lists readable and rely on the configured Prettier Tailwind plugin for sorting.

## Do Not

- Do not add new frontend dependencies without approval.
- Do not move core directories or introduce a new top-level frontend architecture.
- Do not bypass shared components when an equivalent already exists in the codebase.

## Enforcement

- Treat all items in this instruction as hard rules unless the user explicitly overrides them in the current request.
