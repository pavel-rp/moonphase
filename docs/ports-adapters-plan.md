# Ports & Adapters Refactor Plan

> Date generated: <!-- TODO: replace at commit time -->

## 1. Inventory of Current API Code

After an automated scan of the repository we found **no server API route handlers** under `app/api/**` or legacy `pages/api/**`.  The current application appears to be 100 % client-side rendering plus static data.

Therefore, the first refactor milestone focuses on laying down the architectural scaffolding without disrupting behaviour.  Future PRs can incrementally migrate any new or incoming endpoints into the structure described below.

## 2. Vendors Detected

None detected (no direct Moralis, Santiment/Sentiment, OpenAI, or other outbound SDK usage).

We nonetheless scaffold directories for these common vendors so that new adapters can be dropped in with zero config.

```
src/
└─ adapters/
   ├─ moralis/
   ├─ santiment/
   └─ openai/
```

## 3. Mapping of Existing Modules → New Layers

Because there are currently no service or API modules that talk to external systems, there is **no mapping required**.  All existing component and utility files remain in place.  They will gradually migrate as new features demand.

| Old Module | New Layer | Notes |
|------------|-----------|-------|
| _N/A_      | _N/A_     | No IO-bearing modules found |

## 4. Test Migration Plan

1. Maintain the existing Vitest & Jest configuration until we fully switch to Vitest.
2. Place any new unit tests adjacent to their layer folders, mirroring source structure (e.g. `src/usecases/__tests__/…`).
3. When new adapters are introduced, add MSW contract tests inside `src/adapters/<vendor>/__tests__`.
4. Once real API routes exist, integration tests will live in `app/api/**/__tests__`.

Current test coverage remains unchanged because no behavioural code moves in this commit.

---

This document will be updated in subsequent PRs when endpoints and external calls are added.