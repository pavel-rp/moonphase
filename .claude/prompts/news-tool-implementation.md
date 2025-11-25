# Meta-Prompt: Cryptocurrency News Tool Implementation

## Overview
Implement a LangChain tool that fetches cryptocurrency news from NewsAPI.org, following MoonPhase's Clean Architecture patterns with Ports & Adapters.

## Stage 1: Research (Execute First)

**Objective**: Understand existing patterns and gather implementation context.

**Tasks**:
1. Examine existing adapter patterns:
   - Read [src/adapters/coincap/CoinCapAdapter.ts](src/adapters/coincap/CoinCapAdapter.ts) for HTTP client patterns
   - Read [src/adapters/binance/BinanceAdapter.ts](src/adapters/binance/BinanceAdapter.ts) for error handling
   - Review [src/adapters/mock/](src/adapters/mock/) for fallback patterns

2. Understand port interface conventions:
   - Read [src/ports/MarketDataPort.ts](src/ports/MarketDataPort.ts)
   - Note domain model patterns in [src/domain/](src/domain/)

3. Check existing LangChain integrations:
   - Search for any existing LangChain tools: `**/*langchain*.ts`
   - Review tool patterns if found

4. Review HTTP utilities:
   - Read [src/lib/http/fetcher.ts](src/lib/http/fetcher.ts) for retry logic
   - Read [src/lib/http/inflight.ts](src/lib/http/inflight.ts) for deduplication

5. Check environment configuration:
   - Read [src/lib/env.ts](src/lib/env.ts) for validation patterns
   - Review [.env.local](.env.local) (if exists)

6. Understand error handling:
   - Read [src/lib/errors.ts](src/lib/errors.ts) for typed error classes

**Deliverable**: Summary of:
- Adapter pattern conventions (constructor, error handling, retry logic)
- Port interface structure
- Domain model conventions
- Environment variable validation approach
- Whether LangChain is already in the project (check package.json)

---

## Stage 2: Plan (Execute After Research)

**Objective**: Design the implementation following discovered patterns.

**Context from Stage 1**: [Research findings will inform this stage]

**Planning Tasks**:

1. **API Design**:
   - NewsAPI.org endpoint: `https://newsapi.org/v2/everything?q={symbol}&sortBy=publishedAt&language=en&pageSize={limit}`
   - Response shape: `{ articles: Array<{ title, description, url, publishedAt, source, content }> }`
   - Rate limits: 100 requests/day (free tier) - consider caching

2. **Domain Model** (`src/domain/NewsArticle.ts`):
   ```typescript
   export interface NewsArticle {
     title: string
     description: string | null
     url: string
     publishedAt: string
     source: {
       name: string
     }
     content: string | null
   }
   ```

3. **Port Interface** (`src/ports/NewsPort.ts`):
   ```typescript
   export interface NewsPort {
     fetchNews(params: { symbol: string; limit?: number }): Promise<NewsArticle[]>
   }
   ```

4. **Adapter** (`src/adapters/news/NewsAdapter.ts`):
   - Use `fetchWithRetry` from `src/lib/http/fetcher.ts`
   - Implement `dedupe()` for concurrent request prevention
   - Map NewsAPI response to domain model
   - Handle API errors gracefully (return empty array on failure)
   - Add observability logging

5. **LangChain Tool** (`src/adapters/langchain/tools/newsTool.ts`):
   - Extend `StructuredTool` from `@langchain/core/tools`
   - Zod schema: `{ symbol: z.string(), limit: z.number().optional().default(5) }`
   - Description: "Fetches recent cryptocurrency news articles for sentiment analysis. Input: symbol (e.g., BTC, ETH), optional limit (default 5). Returns JSON array of news articles with title, description, url, publishedAt, and source."
   - Inject NewsPort via constructor (dependency injection)
   - Return JSON.stringify(articles) for LLM consumption

6. **Environment Setup**:
   - Add `NEWS_API_KEY` to [src/lib/env.ts](src/lib/env.ts) validation (optional, with fallback)
   - Update [.env.local](.env.local) template in docs

7. **Mock Adapter** (`src/adapters/news/MockNewsAdapter.ts`):
   - Implement NewsPort with realistic mock data
   - 3-5 sample articles per symbol
   - Use for development/testing when NEWS_API_KEY unavailable

8. **Testing**:
   - Unit test: `src/adapters/news/__tests__/NewsAdapter.test.ts`
     - Mock fetch responses with MSW
     - Test successful response mapping
     - Test error handling (API down, invalid response)
     - Test deduplication
   - Tool test: `src/adapters/langchain/tools/__tests__/newsTool.test.ts`
     - Mock NewsPort implementation
     - Test Zod schema validation
     - Test JSON output format

9. **File Checklist**:
   - [ ] `src/domain/NewsArticle.ts` - Domain model
   - [ ] `src/ports/NewsPort.ts` - Port interface
   - [ ] `src/adapters/news/NewsAdapter.ts` - Real API adapter
   - [ ] `src/adapters/news/MockNewsAdapter.ts` - Mock adapter
   - [ ] `src/adapters/langchain/tools/newsTool.ts` - LangChain tool
   - [ ] `src/adapters/news/__tests__/NewsAdapter.test.ts` - Adapter tests
   - [ ] `src/adapters/langchain/tools/__tests__/newsTool.test.ts` - Tool tests
   - [ ] Update `src/lib/env.ts` - Add NEWS_API_KEY validation
   - [ ] Update `.env.local` example in docs

**Deliverable**: Detailed implementation plan with:
- File-by-file implementation order
- Code snippets for key components
- Test coverage strategy
- Risk mitigation (rate limits, API failures)

---

## Stage 3: Implement (Execute After Planning)

**Objective**: Build the feature incrementally with validation at each step.

**Context from Stage 2**: [Implementation plan will guide this stage]

**Implementation Steps**:

### Step 1: Domain Model & Port Interface
1. Create `src/domain/NewsArticle.ts` with TypeScript interface
2. Create `src/ports/NewsPort.ts` with port interface
3. Run `pnpm typecheck` to validate

### Step 2: Environment Configuration
1. Update `src/lib/env.ts`:
   - Add `NEWS_API_KEY: z.string().optional()` to schema
   - Add getter function with fallback logic
2. Update documentation with `.env.local` example
3. Test with `pnpm typecheck`

### Step 3: News Adapter (Real)
1. Create `src/adapters/news/NewsAdapter.ts`:
   - Implement constructor with base URL and API key
   - Implement `fetchNews()` with retry logic
   - Add request deduplication via `dedupe()`
   - Map API response to domain model
   - Add error handling (return empty array on failure)
   - Add observability logging
2. Run `pnpm typecheck`

### Step 4: Mock Adapter
1. Create `src/adapters/news/MockNewsAdapter.ts`:
   - Implement NewsPort with static mock data
   - 3-5 realistic articles per symbol
   - Simulate async delay (100ms)
2. Run `pnpm typecheck`

### Step 5: LangChain Tool
1. Install LangChain if needed: `pnpm add @langchain/core zod`
2. Create `src/adapters/langchain/tools/newsTool.ts`:
   - Extend `StructuredTool`
   - Define Zod schema for inputs
   - Implement `_call()` method with NewsPort injection
   - Return JSON.stringify(articles)
3. Run `pnpm typecheck`

### Step 6: Testing - Adapter
1. Create `src/adapters/news/__tests__/NewsAdapter.test.ts`:
   - Test successful API call and mapping
   - Test error handling (network error, invalid JSON)
   - Test deduplication (concurrent requests)
   - Test empty results handling
2. Run `pnpm test --testPathPattern=NewsAdapter`

### Step 7: Testing - Tool
1. Create `src/adapters/langchain/tools/__tests__/newsTool.test.ts`:
   - Mock NewsPort implementation
   - Test valid inputs (symbol, limit)
   - Test invalid inputs (schema validation)
   - Test JSON output format
   - Test integration with mock adapter
2. Run `pnpm test --testPathPattern=newsTool`

### Step 8: Integration & Preflight
1. Run full test suite: `pnpm test`
2. Run preflight checks: `pnpm preflight`
3. Fix any lint/type errors
4. Verify all acceptance criteria met

### Step 9: Documentation Update
1. Add news tool docs to relevant README or docs folder
2. Document NewsAPI setup instructions
3. Add mock adapter usage example

**Validation at Each Step**:
- ✅ `pnpm typecheck` after each file creation
- ✅ `pnpm test` after test file creation
- ✅ `pnpm preflight` before completion

**Deliverable**: Fully implemented, tested, and documented news tool following MoonPhase architecture.

---

## Success Criteria

**Functional**:
- [x] LangChain tool successfully fetches news for given symbol
- [x] Tool gracefully handles API failures (returns empty array)
- [x] Mock adapter provides realistic fallback data
- [x] Tool output format is LLM-friendly (JSON stringified)

**Architectural**:
- [x] Follows Ports & Adapters pattern
- [x] Domain model in `src/domain/`
- [x] Port interface in `src/ports/`
- [x] Adapters in `src/adapters/`
- [x] Proper dependency injection

**Quality**:
- [x] All tests pass (`pnpm test`)
- [x] No type errors (`pnpm typecheck`)
- [x] No lint warnings (`pnpm lint`)
- [x] Preflight checks pass (`pnpm preflight`)
- [x] Code coverage maintained/improved

**Documentation**:
- [x] NEWS_API_KEY documented in env setup
- [x] Tool usage examples provided
- [x] Mock adapter usage explained

---

## Execution Instructions

1. **Copy this entire prompt** into a fresh Claude Code conversation
2. Claude will execute **Stage 1 (Research)** autonomously
3. After research, Claude will present findings and ask for approval to proceed
4. Upon approval, Claude executes **Stage 2 (Plan)** and presents the plan
5. After plan review, Claude executes **Stage 3 (Implement)** with incremental validation
6. Each stage builds on the previous stage's outputs

**Expected Timeline**:
- Research: ~5-10 minutes (file reading, pattern analysis)
- Planning: ~5 minutes (design decisions, file structure)
- Implementation: ~20-30 minutes (coding, testing, preflight)
- **Total: ~30-45 minutes** of autonomous work with approval gates

---

## Notes for Claude

- **Respect Architecture**: Follow discovered patterns from existing adapters
- **Minimal Safe Edits**: Only create/modify files necessary for this feature
- **Test First**: Write tests immediately after implementation code
- **Fail Fast**: Run `pnpm typecheck` and `pnpm test` after each logical unit
- **Graceful Degradation**: API failures should not crash the application
- **Reuse Utilities**: Leverage `fetchWithRetry`, `dedupe`, `observability`, `errors`
- **Mock for Development**: Ensure MockNewsAdapter provides realistic data for UI testing
- **Security**: Never log API keys; validate inputs with Zod
