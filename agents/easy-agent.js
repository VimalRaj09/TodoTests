#!/usr/bin/env node

/**
 * Easy Agent CLI Interface
 * Similar to: "Claude, generate tests for task deletion"
 */

import axios from 'axios';

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || null;
const USE_MOCK = !GROQ_API_KEY;

const agent = {
  name: 'TestGen Agent',
  version: '1.0.0',
};

// Commands
const commands = {
  generate: 'Generate tests for a feature',
  list: 'List all test patterns',
  help: 'Show this help',
};

const testPatterns = {
  'user-auth': 'User login, registration, logout flows',
  'crud': 'Create, Read, Update, Delete operations',
  'validation': 'Form validation and error handling',
  'guardrail': 'LLM safety and bounds testing',
  'performance': 'Load and response time testing',
};

// Simple agent prompt
const askAgent = async (question) => {
  console.log(`\n🤖 Agent: Processing request...`);

  if (USE_MOCK) {
    console.log(`📌 Note: Using mock responses (no GROQ_API_KEY)`);
    console.log(`   Set GROQ_API_KEY to enable real AI generation\n`);

    return generateMockResponse(question);
  }

  // Real Groq API call
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are a helpful QA automation test generation assistant.
            Generate concise, practical test code.
            Always return valid JavaScript/TypeScript code.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return generateMockResponse(question);
  }
};

const generateMockResponse = (question) => {
  // Simple mock responses based on keywords
  if (question.toLowerCase().includes('test')) {
    return `
Here's a test pattern for your feature:

test('Feature test', async ({ page }) => {
  await page.goto('/');
  // Add your steps here
  await expect(page).toHaveTitle(/Pattern/);
});

💡 Tip: Use data-testid attributes for reliable selectors
💡 Tip: Write 1 positive + 1 negative test per feature
`;
  }

  return `
I can help generate tests! Try:
- "Generate tests for user login"
- "Generate guardrail tests for API"
- "Generate validation tests"

Need more? Run: node agents/easy-agent.js help
`;
};

// CLI Interface
const main = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help') {
    console.log(`\n🤖 ${agent.name} v${agent.version}\n`);
    console.log('Commands:');
    Object.entries(commands).forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(12)} - ${desc}`);
    });

    console.log('\nPatterns:');
    Object.entries(testPatterns).forEach(([pattern, desc]) => {
      console.log(`  ${pattern.padEnd(12)} - ${desc}`);
    });

    console.log('\nExamples:');
    console.log('  node agents/easy-agent.js "Generate tests for task creation"');
    console.log('  node agents/easy-agent.js "Generate guardrail tests"');
    console.log('  GROQ_API_KEY=xxx node agents/easy-agent.js "..."');

    return;
  }

  if (args[0] === 'list') {
    console.log('\n📋 Test Patterns:\n');
    Object.entries(testPatterns).forEach(([pattern, desc]) => {
      console.log(`${pattern}: ${desc}`);
    });
    return;
  }

  // Treat everything else as a question
  const question = args.join(' ');
  const response = await askAgent(question);

  console.log('\n' + response + '\n');

  console.log(
    '---\n💬 To ask another question, run: node agents/easy-agent.js "your question"\n'
  );
};

main().catch(console.error);
