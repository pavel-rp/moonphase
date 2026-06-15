# AI Analysis Pipeline — Architecture Review

_Date: June 2026 · Scope: NEU-58 epic and the shipped MVP · Author: engineering review_

## TL;DR — verdict

- **The planned multi-agent design is over-engineered for the goal.** A "Team Lead supervisor orchestrating Candlestick + News expert agents" is the heaviest pattern in the toolbox, and the task — produce a short, on-demand market blurb from price + news — does not need it.
- **The shipped MVP is actually closer to current best practice than the plan.** It's a fixed *workflow* (fetch price/VWAP/news in parallel → one synthesis call), which is exactly what Anthropic recommends you start with. It needs **polish, not a multi-agent rebuild**.
- **Keep the hexagonal port boundary.** `AiAnalysisPort` + use-case + adapter is the right seam and is the most valuable part of the design — it's why swapping the model/provider is a one-line change.
- **Reconsider LangChain here.** The agent loop is never used (tools are invoked directly in code), and LangChain already forced a lazy-dynamic-import hack to survive Jest. For a Next.js streaming UI, the Vercel AI SDK (or even the raw OpenAI SDK) is lighter and gives first-class streaming.
- **Model has been bumped** to the current flagship `gpt-5.5`, made env-overridable, and switched from `temperature` to `reasoning_effort` (GPT-5.x are reasoning models).

## What we're trying to achieve

From the epic and the shipped UI copy, the goal is narrow and well-defined:

> On a crypto asset's detail page, let the user click a button and get a concise (~3–4 paragraph) AI-generated market analysis — market bias, price/VWAP read, news sentiment, one key takeaway — grounded in ~14 days of price history, 24h VWAP, and recent news. Target latency < 10s. Beta, explicitly "not financial advice."

Success criteria that matter: **grounded** (no hallucinated numbers), **fast enough** (< 10s, ideally streaming so it *feels* fast), **cheap enough** to offer free in beta, **reliable** (degrades gracefully when news/price is missing), and **swappable** (provider/model not hard-wired into business logic).

Non-goals: it is not a chatbot, not a multi-turn research agent, not a long-running autonomous task. This framing is the whole ballgame — it's what makes the multi-agent plan the wrong tool.

## What's actually implemented

Grounded in the working tree:

- **Port / use case** — `src/ports/AiAnalysisPort.ts` (`analyzeAsset` + `analyzeAssetStream`); `src/usecases/getAiAnalysis.ts` is a thin pass-through. Clean.
- **Adapter** — `src/adapters/langchain/LangChainAiAdapter.ts`. It builds three LangChain `tool()` objects (price history, VWAP, news) and **invokes them directly in code** via `Promise.allSettled`, formats the results into a context string, and makes **one** `ChatOpenAI` call with a single inline system prompt. `analyzeAssetStream` is a **stub** that yields the whole result at once.
- **Tools** — `tools/priceTools.ts`, `tools/newsTool.ts`; news is backed by `NewsPort` → `NewsAdapter` (NewsAPI.ai) with a `MockNewsAdapter` fallback wired in `compositionRoot.getAiAnalysisDeps`.
- **API** — `app/api/ai-analysis/[symbol]/route.ts`: a non-streaming `POST` returning JSON.
- **UI** — `app/details/[symbol]/_components/ai-analysis-section.tsx`: client component with idle / loading (shimmer) / complete (markdown + regenerate) / error states. No streaming.

**Key observation:** despite the "LangChain agents" framing, **there is no agent and no agentic tool-calling**. The model never decides what to call; the code does. This is a *parallelization workflow* (one of Anthropic's named patterns), not an agent. That's a good thing — it just means the multi-agent plan describes a system nobody built or needs.

A telling smell: `compositionRoot.ts` loads the adapter via dynamic `import()` specifically because "langchain ESM dependencies break Jest at import time." A framework you have to defer-load to keep your test runner alive, for a feature that makes one chat call, is a framework working against you.

## The plan vs. reality

The NEU-58 plan specifies a supervisor (NEU-13) + Team Lead prompt (NEU-12) + Candlestick expert (NEU-14/15) + News expert (NEU-16/17), plus streaming (NEU-20), dedup (NEU-21), and a richer card (NEU-22/24/25). The team shipped a single-call workflow instead. The gap between plan and reality is **mostly scope that shouldn't be built as specified**, plus a few genuinely-missing pieces (real streaming, caching, types, tests, docs).

## Best-practice lens (mid-2026)

**1. Start simple; agents only for open-ended work.** Anthropic's _Building Effective Agents_ is explicit: for many applications, "optimizing single LLM calls with retrieval and in-context examples is usually enough," and you should "find the simplest solution possible, and only increase complexity when needed." Workflows (predefined code paths) are preferred for well-defined tasks; agents are for open-ended problems where you can't hardcode the path. This task is well-defined. → **Workflow, not agents.**

**2. The supervisor pattern is expensive and conditional.** Current guidance puts the LangGraph supervisor at **~1.5–2× latency and ~2–3× cost** versus a single call, justified only when you have "demonstrably distinct task types and a single agent's accuracy plateaus despite prompt iteration" (rule of thumb: a single agent is below ~85% on your evals). There is no eval here showing the single call underperforms, and the task is homogeneous (always: price + news → synthesis). → **Supervisor not justified.**

**3. For Next.js streaming UI, the Vercel AI SDK is the default.** It cuts streaming integration from ~100+ lines to ~20 via `streamText` / `useChat`, ships lighter than LangChain.js, and the common production split is "AI SDK on the frontend for streaming UI, LangChain/LangGraph on the backend **only** when you need real orchestration." You don't need the orchestration half. → **AI SDK (or raw OpenAI SDK) is a better fit than LangChain here.**

**4. Models & reliability.** `gpt-5.1` (the hard-coded value) is retired; **`gpt-5.5` is the April-2026 flagship**, a reasoning model that uses `reasoning_effort` (none→xhigh) rather than `temperature`, and supports streaming + Structured Outputs. OpenAI also recommends **Structured Outputs over describing a schema in the prompt** when you need machine-readable fields.

## Assessment by layer

| Layer | Verdict | Why |
|---|---|---|
| Hexagonal port + use case | **Keep** | Clean seam; makes model/provider swappable. Best part of the design. |
| Orchestration (multi-agent supervisor) | **Don't build** | 2–3× cost/latency for no quality gain on a homogeneous, well-defined task. The shipped parallel-fetch-then-synthesize workflow is the right pattern. |
| Framework (LangChain) | **Reconsider / likely drop** | Agent loop unused; tools called directly; forces a Jest dynamic-import hack; heavier bundle. AI SDK or raw OpenAI SDK is simpler. |
| Streaming | **Real gap — implement** | `analyzeAssetStream` is a stub; route + UI are non-streaming. Biggest *felt* UX win. |
| Model / config | **Done** | Now `gpt-5.5`, env-overridable via `OPENAI_MODEL`, `reasoning_effort: low` instead of `temperature`. |
| Prompt handling | **Externalize** | Inline prompt is fine for one analyst; move to a `prompts/` module for versioning/testing. |
| Output format | **Optional: Structured Outputs** | Only if you want to render Bias/Price/News/Takeaway as distinct UI fields. Free-text markdown is fine otherwise. |
| Reliability / safety | **Address** | News article text is injected into the prompt → prompt-injection surface; delimit/sanitize. Keep disclaimers. Add short-TTL caching (the planned dedup). |

## Recommended target architecture

Keep the parts that are working and lean into the workflow:

1. **Keep** `AiAnalysisPort` and the use case unchanged.
2. **Simplify the adapter** to an explicit workflow: fetch price + VWAP + news in parallel (already done) → one synthesis call. Drop the LangChain `tool()` wrappers (the model doesn't call them) and call the use cases directly; this removes the main reason LangChain is in the dependency tree.
3. **Swap the LLM client** to the Vercel AI SDK's `streamText` (provider `@ai-sdk/openai`) — or the raw OpenAI SDK — so streaming is real end-to-end. Implement `analyzeAssetStream` as a true token stream.
4. **Stream over HTTP** from the route (AI SDK's `toDataStreamResponse()` / SSE) and consume it in the card with `useChat`/`readStreamableValue`, giving the planned shimmer → streaming → reveal feel.
5. **Externalize the prompt**, add a short-TTL cache keyed by `symbol + day` (analyses are stable within a day), and **sanitize news text** fed into the prompt.
6. **If** you later want true "expert" perspectives, the cheapest credible upgrade is a *parallel* two-call map (technical view, news view) + one reduce — still a workflow, no supervisor — and only after an eval shows the single call is insufficient.

This keeps the provider-swappability you designed for, gets you real streaming, and removes a framework you're fighting — without building or maintaining a multi-agent system.

## Impact on the backlog (NEU-58)

If you accept this direction, the board should change:

- **Cancel / re-scope as "won't build":** NEU-12, NEU-13, NEU-14, NEU-15, NEU-16, NEU-17 (multi-agent prompts/agents) and **NEU-780** (the adapter→multi-agent refactor I added earlier). They encode the supervisor design this review recommends against.
- **Re-scope NEU-18/NEU-20:** fold them into "simplify adapter + real streaming via AI SDK."
- **Keep as-is:** NEU-21 (cache/dedup), NEU-27 (mock adapter), NEU-28 (MSW), NEU-29–31 (tests, retargeted to the workflow), NEU-32 (types), NEU-33 (docs), NEU-34 (final verify), and NEU-781 (card relocation, which is framework-agnostic).

This is a deliberate reversal of part of the plan I normalized earlier — worth a short team decision before I touch those issues.

## Risks & caveats

- **Prompt injection from news.** Article titles/bodies are concatenated into the prompt. A crafted headline could try to steer the model. Delimit untrusted text clearly and/or run it through moderation.
- **Numeric grounding.** Good news: the code computes price stats and VWAP deltas in code and hands the model finished numbers — keep doing that; don't let the model do arithmetic.
- **Cost/latency of the flagship.** `gpt-5.5` at default reasoning is pricey ($5/$30 per 1M) and can exceed the 10s target; `reasoning_effort: low` mitigates this, and `OPENAI_MODEL=gpt-5.4-mini` is the cheap/fast escape hatch.
- **This review is opinionated.** The multi-agent design isn't *wrong* — it's premature. If product later wants distinct, independently-evaluated expert analyses with their own iteration cadence, the supervisor becomes defensible. Gate that on evals, not aesthetics.

## Sources

- [Anthropic — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
- [LangGraph Supervisor Pattern: Orchestrating Multi-Agent Teams in 2026 (CallSphere)](https://callsphere.ai/blog/langgraph-supervisor-multi-agent-orchestration-2026)
- [Multi-Agent Orchestration in LangGraph: Supervisor vs Swarm (DEV)](https://dev.to/focused_dot_io/multi-agent-orchestration-in-langgraph-supervisor-vs-swarm-tradeoffs-and-architecture-1b7e)
- [LangChain vs Vercel AI SDK vs OpenAI SDK: 2026 Guide (Strapi)](https://strapi.io/blog/langchain-vs-vercel-ai-sdk-vs-openai-sdk-comparison-guide)
- [OpenAI API — GPT-5.5 model reference](https://developers.openai.com/api/docs/models/gpt-5.5)
- [OpenAI — Model release notes](https://help.openai.com/en/articles/9624314-model-release-notes)
