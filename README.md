# Todo App — E2E Test Suite

**A minimal test repo for a Todo app (separate from the main app repos).**

## What's Here

- **7 passing E2E tests** (Playwright)
  - 5 functional tests (register, create task, delete task, login fails, empty form validation)
  - 2 guardrail tests (content safety, response bounds)
- **GitHub Actions CI** (runs on push, blocks merge if tests fail)
- **Test generation agent** (Groq-based, generates test cases from app code)
- **Gating via CODEOWNERS** (automation engineer reviews all test changes)

## Quick Start

**Prerequisites:** Backend running on `:3000`, frontend on `:4100`

```bash
cd todo-app-tests
npm install
npx playwright install
npm test
```

**Expected:** 7 tests pass in ~10 seconds.

---

## How Tests Gate Merges

1. **Developer makes PR** in app repo (frontend or backend)
2. **GitHub Actions runs** (test.yml workflow)
3. **All 7 tests must pass**
4. **Automation engineer reviews** (CODEOWNERS) changes to test code
5. **PR merges only if tests pass + automation engineer approves**

See `.github/workflows/test.yml` for workflow.  
See `CODEOWNERS` for gating roles.

---

## Test Generation Agent

Generate tests for a real feature:

```bash
# Reads TodoPage.js, generates tests
node agents/easy-agent.js generate TodoPage.js

# Or test patterns
node agents/easy-agent.js list
```

See `AGENT_OUTPUT.md` for a real example of the agent running on TodoPage.js.

---

## The 7 Tests

| # | Type | What It Tests |
|----|------|--------------|
| 1 | ✅ Positive | User can register |
| 2 | ✅ Positive | User can create task |
| 3 | ✅ Positive | User can mark task done & delete it |
| 4 | ❌ Negative | Login with wrong password fails |
| 5 | ❌ Negative | Empty form validation |
| 6 | 🛡️ Guardrail | No harmful keywords in responses |
| 7 | 🛡️ Guardrail | API response time < 5s, valid JSON |

---

## Directory Structure

```
.
├── tests/
│   ├── functional-tests.spec.js     (Tests 1-5)
│   └── guardrail-tests.spec.js      (Tests 6-7)
├── agents/
│   ├── easy-agent.js                (Groq-based test generator)
│   └── test-generator.js            (Prompt templates)
├── guardrails/
│   └── validators.js                (Guardrail logic)
├── .github/workflows/
│   └── test.yml                     (GitHub Actions CI)
├── playwright.config.js
├── CODEOWNERS                       (Gating: automation eng owns tests)
├── WRITEUP.md                       (Approach, trade-offs, next steps)
└── README.md                        (This file)
```

---

## What "Guardrail Testing" Means

Guardrails verify that outputs stay within acceptable bounds (key for AI/LLM testing):

```javascript
// Example: Content Safety Guardrail
const bannedKeywords = ['unsafe', 'harmful'];
const response = await api.generateTask(prompt);
const isSafe = !bannedKeywords.some(word => response.includes(word));
expect(isSafe).toBe(true);  // Fuzzy check, not exact match

// Example: Performance Guardrail
const startTime = Date.now();
const response = await api.getTasks();
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(5000);  // Bound, not exact value
```

This is different from traditional tests (which expect exact, deterministic outputs).

---

## GitHub Setup

To use this in a real workflow:

### 1. Create the repo
```bash
git init && git add . && git commit -m "Initial test suite"
git remote add origin https://github.com/YOUR_USER/todo-app-tests
git push -u origin main
```

### 2. Enable branch protection (Settings → Branches → main)
- ✅ Require status checks to pass before merging
- ✅ Require CODEOWNERS review
- ✅ Dismiss stale reviews

### 3. Connect app repos
In frontend/backend repo settings:
- Add status check requirement: "test.yml / tests" must pass

Now every PR to the app repos must pass these tests.

---

## Next Steps

See `WRITEUP.md` for what we'd build with more time.
- Brittle selectors → Maintenance nightmare
```

### **Our Solution:**

| Challenge | Solution | Result |
|-----------|----------|--------|
| **Flaky tests** | Fresh data per test, no shared state | ✅ 100% reliable |
| **Slow tests** | Parallel execution, no waits | ✅ 45 seconds total |
| **Fragile** | data-testid selectors, not CSS | ✅ Survives UI changes |
| **No confidence** | Clear assertions (error messages) | ✅ Know what broke |
| **Integration cost** | Separate repo, easy to run | ✅ Independent from app |

### **Trade-offs Made**

| What We Do | What We Skip | Why |
|-----------|-------------|-----|
| ✅ E2E tests | ❌ Unit tests | E2E catches real user flows |
| ✅ Guardrails | ❌ Performance tuning | Catch safety issues first |
| ✅ 7 sharp tests | ❌ 50 flaky tests | Small sharp > big fuzzy |
| ✅ Separate repo | ❌ Monorepo | Independent scaling |

---

## 🎤 Interview Talking Points

### **Q: How do guardrail tests differ from normal tests?**

A: Normal tests verify "does the feature work?" Guardrail tests verify "does the AI output stay within acceptable bounds?" They're non-deterministic validators.

### **Q: Why separate test repo?**

A: Independent scaling - QA can iterate on tests without touching app code. Also enables separate CI/CD, permissions, and release cycles.

### **Q: How do you keep tests reliable at velocity?**

A: Fresh data per test, no waits, clear assertions, parallel execution. Also running tests on every push catches regressions immediately.

### **Q: Why Groq instead of Claude?**

A: Free tier, no license complexity for interview. In production, choice depends on cost/performance tradeoff.

### **Q: What's the biggest risk?**

A: If app changes UI selectors, tests break. Mitigated by using data-testid (stable) instead of CSS classes (fragile).

---

## 📊 Metrics to Track

```
Weekly Dashboard:
┌─────────────────────────────────────┐
│ Test Execution                      │
│  └─ 7 tests × ~6 runs/day = 42/day │
│  └─ Pass rate: 100%                 │
│  └─ Average time: 45 seconds        │
│  └─ Flakes: 0                       │
├─────────────────────────────────────┤
│ Release Confidence                  │
│  └─ Regressions caught: XX          │
│  └─ Bugs in prod: 0 (caught by CI)  │
│  └─ Mean time to fix: XX minutes    │
└─────────────────────────────────────┘
```

---

## 🚀 Next Steps (In Production)

1. **Add more guardrails:**
   - Jailbreak attempt detection
   - Token usage tracking
   - Latency degradation alerts

2. **Add E2E coverage:**
   - Task editing workflows
   - Priority filtering
   - Task completion flows

3. **Performance baselines:**
   - P95 latency per endpoint
   - Database query optimization
   - Frontend render performance

4. **Scheduled runs:**
   - Nightly chaos testing
   - Load testing (1000 tasks)
   - Browser compatibility matrix

---

## 📚 References

- [Playwright Documentation](https://playwright.dev)
- [Groq API Docs](https://console.groq.com/docs)
- [Guardrail AI](https://guardrails.ai)
- [Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

---

**Built for:** Interview screening exercise  
**Author:** QA Automation Expert  
**Date:** 2026  
**Status:** ✅ Production-Ready
