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
 * Validate an AI capability output against its contract.
 * @param output - The AI capability output to validate.
 * @param contract - The AI contract configuration.
 * @returns Whether the output validates against the contract.
 */
export function validateAIOutput(
  output: any,
  contract: AIContract
): boolean {
  // Placeholder: In a real implementation, this would use the evaluation harness
  // to validate the output against the contract specifications.
  return true;
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