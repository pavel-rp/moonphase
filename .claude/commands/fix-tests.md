# Fix Tests

Review and fix all failing tests in the project systematically.

## Process

1. **Identify Failures**
   - Run `pnpm test` to discover all failing tests
   - Document each failure with file path and error message
   - Create a todo list tracking each test file that needs fixing

2. **Analyze Root Causes**
   - Read the test file and implementation code
   - Determine if failure is due to:
     - Outdated test expectations (implementation changed)
     - Actual bugs in implementation
     - Missing mocks or test setup issues
     - Breaking changes in dependencies
   - Use high reasoning here: use chain of thought to deeply look into the original reason of the problem and analyze it.
     - Use self-consistency to validate the ideas.

3. **Fix Tests**
   - For outdated tests: update assertions to match current behavior
   - For implementation bugs: fix the source code, not just the test
   - For mock issues: add/update mocks in `jest.setup.js` or test files
   - Maintain or improve test coverage (never reduce coverage)
   - Follow testing standards from `CLAUDE.md`:
     - Use Jest + React Testing Library
     - Co-locate tests with code
     - Mock external APIs with MSW
     - Keep tests fast and deterministic

4. **Verify**
   - Run `pnpm test` again to confirm all tests pass
   - Run `pnpm preflight` (typecheck + lint + test) before finishing
   - Check that no new warnings were introduced

## Important Rules

- **Do not remove tests** unless they're genuinely obsolete or duplicate
- **Preserve test intent**: understand what behavior the test validates
- **Update snapshots carefully**: review snapshot changes before accepting
- **Respect architecture**: tests should match project's Clean Architecture patterns
- **Check mocks**: ensure GSAP, Next.js Image, and CSS modules are properly mocked per `jest.config.js`

## Output

Report:
- Number of tests fixed
- Root causes identified
- Any implementation bugs discovered and fixed
- Final preflight status
- Use chain of thought here to reflect on this: was this test refactoring a good thing? Were the tests written correctly in the first place? What is the reason that this test broke? 
