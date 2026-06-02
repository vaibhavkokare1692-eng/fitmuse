# Agent Roles

- Antigravity: visual prototypes, browser QA, screenshot artifacts.
- Codex: production implementation, checks, commits, release workflow.
- Claude: design, copy, and UX critique only.
- Perplexity / Deep Research: external research only.
- ChatGPT / Product Lead: task strategy, prompt architecture, scope control.

## Routing Rule

Agents must read `docs/ai` first, then their assigned task file. Reports go to `reports/<agent>/`.
