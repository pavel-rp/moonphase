## Contributing and Standards

### Branching and workflow
- Use feature branches from `develop`.
- Open a pull request early; CI runs lint, tests, and build.
- Keep PRs focused and small where possible.

### Commit messages
- Use concise, imperative subject lines.
- Reference issues when applicable.

### Code style
- TypeScript strict mode (`tsconfig.json`).
- ESLint flat config (`eslint.config.mjs`); run `pnpm lint` and fix warnings.
- Prefer descriptive names and small, testable units.

### Tests
- Add/maintain unit tests with Jest and Testing Library.
- Co-locate tests under `__tests__` folders.
- Ensure `pnpm test` passes locally.

### Documentation
- Update relevant docs in `docs/` and the root `README.md` when behavior or public APIs change.
- For UI work, keep `docs/Design-System.md` and `docs/Frontend-Standards.md` in sync (add notes for new variants/utilities).

### Architectural guidelines
- Follow hexagonal boundaries: domain ↔ ports ↔ adapters. UI and API routes depend on use cases, not on adapters directly (except in light wrappers).
- Validate external input with Zod.
- Use `fetchWithRetry` and `inflight` de-duplication for outbound requests.

### Security
- Do not hardcode secrets. Use environment variables.
- Treat upstream errors as untrusted; sanitize messages.

### CI
- Workflow: `.github/workflows/ci.yml` (Node 20, pnpm). Lint → Test → Build must pass before merging.

### Getting help
- File an issue with steps to reproduce, expected vs. actual behavior, and environment details.

### References
- ESLint: [eslint.org](https://eslint.org)
- Testing Library: [testing-library.com](https://testing-library.com)
- Next.js: [nextjs.org](https://nextjs.org)
