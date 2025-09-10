## Frontend Standards (Cursor Guidelines)

### Purpose
Practical rules for implementing UI that conforms to the MoonPhase Design System (2025). Apply these when building or updating frontend features.

### Use Established Patterns
- Prefer primitives from `components/ui/*` (e.g., `Card`, `Button`, `Grid`, `Header`).
- Compose with `CardHeader`, `CardContent`, and optional `CardFooter`/`CardAction` rather than ad-hoc `<div>`s.
- For new panels, start with `Card` and apply `.glassmorphic` where appropriate.

### Leverage Design Tokens
- Use semantic utilities: `bg-primary`, `text-muted-foreground`, `ring`, `border`, etc. Avoid hardcoded hex values.
- Spacing must use Tailwind's scale (4px base). No magic numbers.
- If a new token is required, add it to the theme (CSS variables) and ensure Tailwind safelist coverage.

### Consistent Naming
- Components: PascalCase with descriptive intent (e.g., `AiInsight`, `AnalysisResult`, `CryptoCardClickable`).
- Utilities/classes: kebab-case, short and descriptive (e.g., `.shadow-glow`, `.glassmorphic`, `.transform-3d`).
- Variants: `default`, `secondary`, `ghost`, `outline`, `destructive` (avoid numeric or opaque names).

### Interaction and Motion Practices
- Use purposeful motion: hover transitions approx 200ms; entry/exit approx 300ms with a shared smooth ease-out (e.g., `[0.22,1,0.36,1]`).
- Prefer GPU-friendly transforms/opacity. Avoid layout shifts.
- Provide reduced-motion fallbacks (disable parallax/heavy effects; use simple fades).
- Hover glows on cards should be data-aware (green/red based on deltas) via CSS variables.

### Maintain Accessibility
- Ensure keyboard access and visible focus states across nav, buttons, and clickable cards.
- Do not rely on color alone; add icons/aria labels where meaning is conveyed.
- Keep contrast sufficient on glass surfaces (use `text-card-foreground`).
- Consider `aria-live` for AI output sections that update dynamically.

### Document and Communicate
- Update this doc and `docs/Design-System.md` when adding UI variants or patterns.
- Co-locate prop/usage notes in component files where helpful.
- Include screenshots/GIFs in PRs when visual changes are significant.

### Quick Checklist (PR-ready)
- Uses `components/ui/*` primitives and semantic utilities
- Follows tokenized colors/spacing, no hardcoded values
- Motion is purposeful, performant, and respects reduced-motion
- Focus states and keyboard access verified
- Tests updated/added where behavior changed
- Docs updated when new variants/patterns introduced