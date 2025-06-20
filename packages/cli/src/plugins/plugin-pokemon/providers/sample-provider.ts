import {
  type IAgentRuntime,
  type Memory,
  type Provider,
  type ProviderResult,
  type State,
  logger,
} from "@elizaos/core";

const provider: Provider = {
  name: "SAMPLE_PROVIDER",
  description: "A simple example provider",

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    logger.info("*** Executing SAMPLE_PROVIDER ***");
    return {
      text: "I am a provider",
      values: {},
      data: {},
    };
  },
};

export default provider;