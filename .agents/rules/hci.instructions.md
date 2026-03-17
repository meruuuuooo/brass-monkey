---
description: "Use when designing or changing user-facing interactions in Inertia React pages and components. Enforces practical Human-Computer Interaction (HCI) principles: visibility, feedback, consistency, accessibility, error prevention, and recovery."
name: "Human-Computer Interaction (HCI)"
applyTo:
  - "resources/js/**/*.tsx"
  - "resources/js/**/*.ts"
  - "resources/css/**/*.css"
---

# Human-Computer Interaction (HCI) Rules

## Core Interaction Rules

- Design for recognition over recall: keep actions and navigation visible instead of hidden behind memory-heavy flows.
- Keep interaction patterns consistent across pages, especially labels, button placement, and form behavior.
- Use clear, task-focused wording for labels, helper text, and validation errors.

## Feedback And System Status

- Every user action should provide immediate feedback (loading, success, or error).
- Show explicit loading states for async actions and deferred content.
- Use predictable empty states so users understand what to do next.

## Error Prevention And Recovery

- Prevent common mistakes with constraints, defaults, and inline hints before submission.
- Validate early and show actionable field-level messages.
- Provide recovery paths for failures (retry, back, or safe cancel) instead of dead ends.

## Accessibility Baseline

- Ensure full keyboard navigation for interactive controls.
- Preserve visible focus styles and do not remove focus indicators.
- Use semantic elements and meaningful ARIA attributes only where needed.
- Maintain readable contrast and avoid conveying critical meaning by color alone.

## Input And Layout Ergonomics

- Keep layouts mobile-first with responsive scaling for larger breakpoints.
- Maintain comfortable tap/click targets for primary actions.
- Minimize interaction cost: fewer steps, fewer context switches, and sensible defaults.

## Integration With Existing Stack

- Reuse existing shadcn components from `resources/js/components/ui` before creating new controls.
- Keep page-level orchestration in `resources/js/pages` and shared interaction patterns in `resources/js/components`.
- Follow existing Tailwind v4 token patterns from `resources/css/app.css`.

## Enforcement

- Treat these as hard rules for user-facing UI changes unless the user explicitly overrides a rule in the current request.
