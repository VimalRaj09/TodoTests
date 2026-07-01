import { test, expect } from '@playwright/test';
import { testGuardrailNoHarmfulContent, testGuardrailResponseBounds } from '../guardrails/guardrail-tests.js';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// ============= GUARDRAIL TEST 6: Content Safety =============
test('🛡️ GUARDRAIL 6: No harmful content in responses', async ({ page }) => {
  const result = await testGuardrailNoHarmfulContent(page);

  expect(result.passed).toBe(true);
  expect(result.validation.safe).toBe(true);
  expect(result.validation.foundKeywords).toEqual([]);
});

// ============= GUARDRAIL TEST 7: Response Bounds =============
test('🛡️ GUARDRAIL 7: API response respects bounds (time < 5s)', async ({ page }) => {
  const result = await testGuardrailResponseBounds(page, API);

  expect(result.passed).toBe(true);
  expect(result.responseTime).toBeLessThan(5000);
  expect(result.bounds.hasData).toBe(true);
  expect(result.bounds.statusOk).toBe(true);
});
