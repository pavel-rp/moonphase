# AI-Powered Market Intelligence Integration Plan

## Overview
This plan outlines the steps required to integrate AI-driven market insights into the crypto dashboard. The initiative introduces two user-facing enhancements:

1. A dashboard card summarizing general market conditions using live data from the Binance API and curated news highlights.
2. An asset details page section that leverages LangChain to combine quantitative metrics with conversational AI summaries and news analysis.

The strategy is divided into foundational work, feature implementation phases, and cross-cutting concerns such as testing, observability, and security.

## Phase 0 – Prerequisites & Architecture
- **Confirm data sources and access**
  - Register and configure Binance API credentials (read-only).
  - Identify a news search API (e.g., NewsAPI, SerpAPI, or RSS feeds) and validate usage limits.
- **Decide on execution environment**
  - Ensure the Next.js app has server-side runtime where API keys can be securely used (e.g., Next.js Route Handlers or server actions).
  - Confirm LangChain will run server-side (Node.js environment with necessary dependencies).
- **Define abstractions**
  - Create a `data/providers` layer for market data and news, returning normalized response objects.
  - Introduce a `services/ai` layer encapsulating LangChain prompts, chains, and caching.

## Phase 1 – Foundational Infrastructure
1. **Install dependencies**
   - Add LangChain, chosen LLM client (e.g., OpenAI or Azure OpenAI), and any vector store/search libraries if needed.
   - Include Binance API SDK or implement REST helpers via `fetch`.
2. **Environment configuration**
   - Add environment variables (`BINANCE_API_KEY`, `BINANCE_API_SECRET`, `NEWS_API_KEY`, `OPENAI_API_KEY`).
   - Update `next.config.ts` to whitelist domains for images/content if required.
3. **Utility scaffolding**
   - Implement reusable fetch utilities with timeout, retry, and rate-limit handling.
   - Define shared TypeScript interfaces for market metrics, news articles, and AI responses.
4. **LangChain setup**
   - Create initial chains/prompts:
     - Market summary chain: ingest quantitative data + top headlines, output bullet summary and key stats.
     - Asset insight chain: tailored for specific coins with historical context and risk notes.
   - Decide caching strategy (in-memory vs. persistent) to avoid repetitive LLM calls.

## Phase 2 – Dashboard Market Overview Card
1. **Data acquisition**
   - Implement server-side function to pull global market metrics from Binance (e.g., BTC/ETH dominance, volume, price movements).
   - Fetch top 3–5 relevant news items via search API filtered by “crypto market”.
2. **AI synthesis**
   - Pass structured data to market summary chain to generate concise overview text.
   - Store both raw metrics and AI summary in cache/store with timestamp.
3. **UI implementation**
   - Design a responsive card component displaying:
     - Headline AI summary (1–2 sentences).
     - Key stats grid (e.g., total market cap change %, top mover, volume).
     - Latest headlines with links.
   - Use skeleton loaders or shimmer while data is loading.
4. **Data fetching pattern**
   - Use Next.js server components or route handler (`/api/market-overview`) to aggregate data and return JSON.
   - Front-end card fetches from this endpoint, with ISR or SWR for periodic refresh (e.g., every 5 minutes).
5. **Testing**
   - Unit tests for data provider normalization and LangChain prompt outputs (mocked LLM).
   - Integration test for API route ensuring combined payload.

## Phase 3 – Details Page AI Insights
1. **API extensions**
   - Create route handler (`/api/assets/[symbol]/insights`) pulling:
     - Asset-specific Binance metrics (price history, volatility, order book snapshot).
     - Relevant news/articles filtered by the asset ticker.
   - Optional: integrate on-chain metrics providers if needed.
2. **LangChain workflow**
   - Build a conversational chain with tools:
     - Tool 1: Market data retriever (Binance).
     - Tool 2: News search retriever.
     - Tool 3: Optional custom analytics (moving averages, RSI).
   - Configure prompts to produce:
     - Short narrative summary (current trend, momentum).
     - Risk assessment or watch items.
     - Suggested follow-up questions for user engagement.
3. **UI/UX**
   - Add new section on details page with:
     - AI-generated insight card (summary + bullet points).
     - Interactive Q&A panel leveraging LangChain conversational memory for follow-up questions.
     - Display supporting data tables/charts (sparkline, volume chart) alongside AI text.
4. **State management**
   - Use React Query or SWR for API calls, caching results per asset.
   - Provide optimistic UI with fallback to non-AI data if API fails.
5. **Testing**
   - Mocked tests for LangChain chain ensuring prompt compliance and output structure.
   - UI tests verifying components render summaries and handle loading/error states.

## Phase 4 – Observability, Reliability & Security
- **Monitoring**
  - Add logging around API calls, LLM requests, latency, and cache hits.
  - Integrate basic analytics to observe card usage and user interactions.
- **Error handling**
  - Implement graceful fallbacks when external APIs fail (e.g., display last cached result or user-friendly message).
- **Cost controls**
  - Rate-limit LangChain endpoint usage; consider summarizing multiple assets in batch to minimize tokens.
- **Security**
  - Store API keys via environment variables and secrets management.
  - Validate and sanitize any user-provided prompts/questions before sending to LLM.

## Phase 5 – Launch Readiness
- **Documentation**
  - Update README with setup instructions (API keys, environment variables).
  - Document LangChain prompt strategies and maintenance tips.
- **Performance review**
  - Load test API routes to ensure they meet response time targets (<2s for cached responses).
  - Review UX flow with stakeholders and adjust messaging/visuals.
- **Rollout strategy**
  - Deploy behind feature flag to gather feedback.
  - Monitor metrics and iterate on prompt tuning and data presentation.

## Future Enhancements (Post-MVP)
- Integrate additional exchanges or on-chain analytics for richer data.
- Introduce personalization (user watchlists) influencing AI summaries.
- Add notification system for significant market events detected by AI triggers.
- Explore vector store of past news to provide historical context in conversations.

