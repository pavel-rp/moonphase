# MoonPhase Charts (Proto)

Location: `components/charts/*`

- Core helpers in `components/charts/core/*` (geometry, theme tokens, GSAP presets, types)
- Pie variants in `components/charts/pie/*`

Example (Holo pie):

```tsx
import { Holo } from "@/components/charts/pie";

<Holo
  data={[
    { label: "BTC", value: 42, color: "#7ee787" },
    { label: "ETH", value: 25, color: "#3fb0ff" },
  ]}
  size={220}
  animate
  onSliceHover={(d, i) => {}}
  onSliceClick={(d, i) => {}}
/>
```

Notes
- Uses design tokens via `pie-theme.ts` (no hardcoded styling beyond palette defaults).
- Motion uses GSAP with transform/opacities only; heavy blur stays static.
- Public APIs are typed in `core/types.ts`.

