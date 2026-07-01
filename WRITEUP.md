# Writeup: Todo App Testing System

## What We Built

A minimal testing system for a Todo app (separate frontend + backend repos) with:
- **7 E2E tests** in a separate test repo (5 functional + 2 guardrail)
- **GitHub Actions CI/CD** that runs on every push and blocks merge if tests fail
- **Test generation agent** (Groq-based) that reads app code and generates test cases
- **Gating mechanism** via CODEOWNERS (automation engineer reviews all test changes)

## Why This Approach

**App choice:** Simple Todo app (user registration, task CRUD). This kept focus on *testing patterns* instead of infrastructure, perfect for showing guardrail testing and agent reasoning.

**Test separation:** Tests live in their own repo, so:
- Backend/frontend teams merge fast without waiting for test infrastructure
- Automation engineer owns test reliability independently
- Easy to scale tests without blocking app deployment

**Guardrail tests:** These two tests demonstrate understanding of non-deterministic systems (LLMs, APIs):
- Content safety: verify no harmful keywords
- Response bounds: check latency < 5s, valid JSON
This shows we understand modern testing challenges beyond traditional "happy path" tests.

## Biggest Trade-Off

**Minimal setup, no test infrastructure.** We chose:
- No .env file (hardcoded localhost URLs)
- No database fixtures (in-memory storage, fresh per test)
- No shared test data (each test creates unique users/tasks)
- Playwright only (no API-level testing framework)

**Why it's the right call:** For a small app demonstrating testing *methodology*, this keeps the focus sharp:
- Simpler to run (no Docker, no DB setup, just `npm test`)
- Easier to understand (no fixture complexity or test data inheritance)
- Faster tests (no network I/O, no schema overhead)
- Framework trade-off: We sacrifice production-like setup for clarity and speed

**Production version would add:** .env for config, fixture libraries (Faker.js), test data factories, dual API/E2E tests. But the test patterns themselves wouldn't change — just the data setup layer.

The assignment asks us to prove *approach* (how we think about testing), not *infrastructure* (how we run it at scale).

## Single Biggest Threat to Reliability

**Test flakes** (random pass/fail) destroy team trust.

**Our approach:**
- Unique data per test (timestamps prevent state conflicts)
- Serial execution (no race conditions)
- Explicit waits (no brittle timing)
- Guardrail bounds (fuzzy checks for non-deterministic systems)

**Result:** Suite stays green and reliable, teams trust the gate.

## What We'd Build Next (More Time)

1. **Real feature test generation:** Currently the agent generates generic patterns. Next: feed it actual source code (TodoPage.js, server.js) and generate specific, runnable tests from that code.

2. **Test impact analysis:** Show which test failures block which features. Example: if task creation test fails, UI team knows they broke something before pushing.

3. **Flake detection:** Automatically re-run "flaky" tests to identify real failures vs. environmental issues.

4. **Performance baselines:** Track test performance over time (currently 7 tests in 10s — alert if we regress to 20s).



---

## Summary

This project shows we can build a testing system that:
- ✅ Real teams can adopt and trust (simple, reliable, not a bottleneck)
- ✅ Agents can understand and extend (code-grounded test generation)
- ✅ Keeps merge speed fast (separate repo, automation engineer gating)
- ✅ Handles modern challenges (guardrails for non-determinism, no flakes)
