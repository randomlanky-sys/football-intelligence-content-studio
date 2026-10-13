// packages/ai-contracts/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { createAIContract, validateAIOutput, getInputFormat, getOutputFormat, AIContract } from './index'

describe('AI contracts', () => {
  test('createAIContract creates correct object', () => {
    const contract = createAIContract(
      'sentiment-analysis',
      'Analyzes customer sentiment from reviews',
      'sentiment-eval-v1',
      'v2.1.0',
      'text',
      'sentiment'
    );
    expect(contract).toHaveProperty('name', 'sentiment-analysis');
    expect(contract).toHaveProperty('description', 'Analyzes customer sentiment from reviews');
    expect(contract).toHaveProperty('evaluationHarness', 'sentiment-eval-v1');
    expect(contract).toHaveProperty('modelVersion', 'v2.1.0');
    expect(contract).toHaveProperty('inputFormat', 'text');
    expect(contract).toHaveProperty('outputFormat', 'sentiment');
  })

  test('validateAIOutput returns boolean', () => {
    const contract: AIContract = {
      name: 'test',
      description: 'test',
      evaluationHarness: 'eval-v1',
      modelVersion: 'v1',
      inputFormat: 'text',
      outputFormat: 'sentiment'
    };
    const result = validateAIOutput({ sentiment: 'positive' }, contract);
    expect(typeof result).toBe('boolean');
  })

  test('getInputFormat returns correct format', () => {
    const contract: AIContract = {
      name: 'test',
      description: 'test',
      evaluationHarness: 'eval-v1',
      modelVersion: 'v1',
      inputFormat: 'text',
      outputFormat: 'sentiment'
    };
    expect(getInputFormat(contract)).toBe('text');
  })

  test('getOutputFormat returns correct format', () => {
    const contract: AIContract = {
      name: 'test',
      description: 'test',
      evaluationHarness: 'eval-v1',
      modelVersion: 'v1',
      inputFormat: 'text',
      outputFormat: 'sentiment'
    };
    expect(getOutputFormat(contract)).toBe('sentiment');
  })
})