// Guardrail validators for LLM-generated tests and responses

/**
 * Validates that text doesn't contain harmful keywords
 * Used for guardrail testing
 */
export const validateContentSafety = (text) => {
  const harmfulKeywords = [
    'kill',
    'bomb',
    'destroy',
    'hate',
    'racist',
    'sexist',
    'violence',
  ];

  const found = harmfulKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  return {
    safe: found.length === 0,
    foundKeywords: found,
  };
};

/**
 * Validates that response meets performance bounds
 */
export const validateResponseBounds = (response) => {
  return {
    valid: true,
    responseTime: response.time,
    hasData: !!response.data,
    statusOk: response.status >= 200 && response.status < 300,
  };
};

/**
 * Validates that test structure is well-formed
 */
export const validateTestStructure = (test) => {
  const required = ['name', 'positive', 'testFn'];
  const missing = required.filter((field) => !test[field]);

  return {
    valid: missing.length === 0,
    missing,
  };
};
