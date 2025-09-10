## MoonPhase Design System — 2025 Update

### Design Philosophy & Visual Identity
MoonPhase embraces a sleek, futuristic aesthetic that reinforces its AI‑powered crypto focus. The tone is premium and modern: a high‑end, intelligent dashboard that emphasizes clarity of data with cutting‑edge flair. Smooth animations, consistent styling, and immersive ambient details instill trust while keeping information legible and actionable.

### Key 2025 Design Trends & Rationale

#### Glassmorphism
- Translucent “glass” surfaces with backdrop blur and gradient highlights add depth and layering.
- Applied to key containers (cards, header, nav pills) to create a holographic feel while preserving readability.
- Text always uses the `text-card-foreground` token over blurred backdrops to maintain contrast.
- Use selectively (e.g. cards, header). Prefer solid backgrounds for long‑form text.

#### Parallax & Depth
- Parallax background (cosmic/moon imagery) moves slower than content for immersive atmosphere.
- Interactive cards may use 3D transforms: slight tilt and lift on hover via utilities such as `transform-3d`, `transform-gpu`, and `translate-z`.
- The effect should feel tactile and responsive without distracting from data.

#### Semantic & Purposeful Animation
- Animations communicate meaning/state. Example: cards glow green/red on hover to reinforce positive/negative deltas.
- Sparkline charts animate with a draw‑on effect (GSAP) to highlight recent performance.
- Hover transitions use ~200ms ease; component entry/updates use ~300ms ease‑out. Prefer transforms/opacity over layout shifts.

#### Ambient Feedback & Cues
- Use shimmer/skeleton states (frosted glass placeholders) instead of spinners during loads.
- Backgrounds may twinkle or drift subtly (~80% opacity). Ambient “thinking” cues (gentle pulse) signal AI activity.
- Respect `prefers-reduced-motion`: disable parallax/heavy animation; keep essential feedback via simple fades.

### Core UI Components & Patterns

#### Card Surfaces and Layout
- Cards are elevated, modular panels. Default: subtle border/shadow, medium rounding (`--radius-xl` ~10px+), consistent internal spacing.
- Structure: `CardHeader` (title/actions), `CardContent` (primary data), optional `CardFooter`/`CardAction`.
- A `.glassmorphic` variant converts a standard card into a frosted panel (semi‑transparent tint + backdrop blur + inner highlight).
- Hoverable cards (e.g., asset tiles) can tilt in 3D and emit a border glow (`hover:shadow-glow`). Glow color derives from data via a CSS variable (e.g., green for gains, red for losses).
- Non‑interactive info cards do not tilt/glow.
- Grids maintain consistent gaps (`gap-6`) and responsive wrapping. Layout centers content up to ~1280px.

#### Typography & Iconography
- Primary font: Geist Sans; complementary monospace: Geist Mono for numeric/code contexts.
- High contrast against backdrop in both light/dark modes.
- Hierarchy: larger, bold headers (e.g., `text-2xl`/`text-3xl`), concise labels (`text-sm`–`text-lg`).
- Icons: Lucide for UI controls; cryptocurrency icon set for asset logos. Line style, consistent sizing (≈30px in cards, ≈48px in detail headers). Ensure accessible labels/alt text.

#### Header & Navigation
- Fixed, translucent top bar using glassmorphism with a soft fade to content below.
- Logo + horizontal nav pills on the right. Pills: subtle translucent background, 1px alpha border, backdrop blur.
- Hover: pill opacity increases slightly; border highlight intensifies.
- Focus: visible glowing ring (emerald accent). Links remain fully keyboard‑accessible.

#### Buttons & Controls
- Variant system with semantic roles: `primary`, `secondary`, `ghost`, `outline`, `destructive`.
- Rectangular with medium rounding (`--radius-md`).
- Interaction: ~10% light/dark hover adjustments; clear focus ring; disabled state uses `opacity-50 pointer-events-none`.
- On glass cards, prefer `outline`/`ghost` variants for subtle emphasis; use `primary` for key actions.

#### Data Display & Feedback Elements
- Emphasize key metrics with subtle neon‑like text glows (text‑shadow tied to the same glow variable used by card hover).
- Use semantic color consistently: green for positive, red for negative, neutral gray otherwise.
- Sparklines: thin stroke, single color, animate on load to indicate update.
- Errors: concise, styled message/banner or toast with destructive color token; minimal yet noticeable.

#### AI Analysis & Generated Content
- AI Analysis appears within a glass card. Initial CTA transitions to content state on generation.
- Content style: clear body text; may include small AI icon/label. Optionally emphasize notable predictions/keywords (e.g., `+12%`) using semantic color and weight.
- Entry: quick border pulse or fade‑in/up (≈300ms). Long content can scroll within the bounded card.
- Multiple analyses may overwrite or append with timestamp/version; avoid chat‑like UI unless explicitly built.

### Theming, Tokens & Naming Conventions
- Semantic tokens via CSS custom properties: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-muted`, with foreground counterparts.
- Light/dark modes swap variable values; components consume semantic utilities (e.g., `bg-primary`, `text-muted-foreground`).
- Spacing/radii use a 4px base scale (e.g., `--radius-sm`, `--radius-md`, `--radius-xl`).
- New tokens follow `--color-name-level` and include matching `*-foreground` where text is expected.
- Custom utilities (e.g., `.glassmorphic`, `.shadow-glow`, `.transform-3d`) are short, descriptive, and encapsulate complex effects.
- Component naming is clear and PascalCase (e.g., `MarketDataCard`, `CryptoCardClickable`). Variants use descriptive keys (`default`, `secondary`, `destructive`).

### Interaction & Accessibility Guidelines
- Keyboard and screen‑reader accessible by default; all interactive elements include visible focus states.
- Never rely on color alone to convey meaning; pair with icons/labels where appropriate.
- Honor `prefers-reduced-motion`. Keep animations performant (GPU transforms), short, and non‑blocking.
- Provide immediate feedback for actions (e.g., swap to loading state within ~100ms on AI generation).

### Implementation Notes
- Reuse primitives in `components/ui/*` (e.g., `Card`, `Button`, `Grid`, `Header`). Avoid bespoke markup.
- Use semantic Tailwind utilities and existing helpers (e.g., positive/negative value helpers) rather than hardcoding colors.
- For parallax, use the existing background asset (e.g., `public/moon-bg.jpg`) and ensure reduced‑motion fallbacks.
- Document new component variants and utilities alongside their intended usage.

### Related Documents
- See: `docs/Frontend-Standards.md` for implementation standards and Cursor guidelines.