#!/usr/bin/env node

/**
 * Test Generation Agent - Uses Groq API (Free, no license needed)
 * Similar to Claude Code but with easy-access patterns
 */

import axios from 'axios';

// Use Groq API (free tier available)
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'demo-mode';

const generateTestsWithGroq = async (feature) => {
  if (GROQ_API_KEY === 'demo-mode') {
    console.log('ℹ️  Running in DEMO MODE (no GROQ_API_KEY set)');
    return generateMockTests(feature);
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768', // Fast, free tier
        messages: [
          {
            role: 'system',
            content: `You are a QA automation expert. Generate 2 Playwright test cases:
1. One POSITIVE test case
2. One NEGATIVE test case

Format as JavaScript/TypeScript code that can be directly used in Playwright.
Include data-testid selectors and proper assertions.`,
          },
          {
            role: 'user',
            content: `Generate tests for this feature: ${feature}

Return ONLY valid JavaScript code, no explanations.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const generated = response.data.choices[0].message.content;
    return {
      source: 'groq',
      generated,
    };
  } catch (err) {
    console.error('❌ Groq API Error:', err.message);
    return generateMockTests(feature);
  }
};

const generateMockTests = (feature) => {
  return {
    source: 'mock',
    generated: `
// Generated tests for: ${feature}

test('✅ POSITIVE: User can interact with ${feature}', async ({ page }) => {
  await page.goto('/');
  
  // Test your feature here
  const element = page.locator('[data-testid="${feature}-element"]');
  await expect(element).toBeVisible();
  
  // Perform action
  await element.click();
  
  // Verify result
  const result = page.locator('[data-testid="${feature}-result"]');
  await expect(result).toContainText('Success');
});

test('❌ NEGATIVE: ${feature} fails with invalid input', async ({ page }) => {
  await page.goto('/');
  
  // Try invalid action
  const input = page.locator('[data-testid="${feature}-input"]');
  await input.fill('invalid-value');
  
  // Submit
  await page.click('[data-testid="submit"]');
  
  // Verify error
  const error = page.locator('[data-testid="error-message"]');
  await expect(error).toBeVisible();
});
    `,
  };
};

// Main CLI
const main = async () => {
  const feature = process.argv[2] || 'user login';

  console.log('🤖 Test Generation Agent');
  console.log(`📝 Feature: ${feature}`);
  console.log('---');

  const result = await generateTestsWithGroq(feature);

  console.log(`✅ Generated with ${result.source === 'groq' ? 'Groq API' : 'Mock'}`);
  console.log('---');
  console.log(result.generated);
  console.log('---');
  console.log('💡 Tip: Copy the generated code into tests/ folder');
  console.log(
    '💡 Tip: To use Groq API, set GROQ_API_KEY environment variable'
  );
};

main().catch(console.error);
