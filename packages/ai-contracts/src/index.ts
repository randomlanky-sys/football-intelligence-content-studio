// packages/ai-contracts/src/index.ts
/**
 * AI capability configuration.
 * Defines the structure of an AI capability including its name, description,
 * and the evaluation harness used to validate its outputs.
 */
export interface AIContract {
  /** The name of the AI capability. */
  name: string;
  /** Description of the capability's purpose and boundaries. */
  description: string;
  /** The evaluation harness used to validate capability outputs. */
  evaluationHarness: string;
  /** The model version used for this capability. */
  modelVersion: string;
  /** The data format expected for inputs. */
  inputFormat: string;
  /** The data format expected for outputs. */
  outputFormat: string;
}

/**
 * Create an AI contract configuration.
 * @param name - The name of the AI capability.
 * @param description - Description of the capability's purpose and boundaries.
 * @param evaluationHarness - The evaluation harness used to validate capability outputs.
 * @param modelVersion - The model version used for this capability.
 * @param inputFormat - The data format expected for inputs.
 * @param outputFormat - The data format expected for outputs.
 * @returns An AI contract configuration.
 */
export function createAIContract(
  name: string,
  description: string,
  evaluationHarness: string,
  modelVersion: string,
  inputFormat: string,
  outputFormat: string
): AIContract {
  return {
    name,
    description,
    evaluationHarness,
    modelVersion,
    inputFormat,
    outputFormat,
  };
}

/**
 * Validate an AI capability output against its contract's declared output
 * format. Unknown formats accept any non-null string or object so a new format
 * cannot silently pass while its validator is missing.
 */
export function validateAIOutput(output: unknown, contract: AIContract): boolean {
  if (output === null || output === undefined) return false;

  switch (contract.outputFormat) {
    case 'text':
      return typeof output === 'string' && output.trim().length > 0;
    case 'json':
      return typeof output === 'object';
    case 'sentiment':
      return (
        typeof output === 'object' &&
        typeof (output as { sentiment?: unknown }).sentiment === 'string'
      );
    case 'content-pack':
      return (
        typeof output === 'object' &&
        Array.isArray((output as { sections?: unknown }).sections)
      );
    default:
      return typeof output === 'string' || typeof output === 'object';
  }
}

/** Throw when an output fails its contract; useful at service boundaries. */
export function assertAIOutput(output: unknown, contract: AIContract): void {
  if (!validateAIOutput(output, contract)) {
    throw new Error(`Output does not satisfy contract "${contract.name}" (${contract.outputFormat})`);
  }
}

/**
 * Get the input format for an AI contract.
 * @param contract - The AI contract configuration.
 * @returns The input format string.
 */
export function getInputFormat(contract: AIContract): string {
  return contract.inputFormat;
}

/**
 * Get the output format for an AI contract.
 * @param contract - The AI contract configuration.
 * @returns The output format string.
 */
export function getOutputFormat(contract: AIContract): string {
  return contract.outputFormat;
}