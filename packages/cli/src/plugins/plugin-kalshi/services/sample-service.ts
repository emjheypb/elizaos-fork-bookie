import { type IAgentRuntime, Service, logger } from "@elizaos/core";

class SampleService extends Service {
  static serviceType = "service";
  capabilityDescription =
    "This is a sample service which is attached to the agent through a plugin.";

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    logger.info("*** SampleService initialized ***");
  }

  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting SAMPLE service ***");
    const service = new SampleService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping SAMPLE service ***");
    // get the service from the runtime
    const service = runtime.getService(SampleService.serviceType);
    if (!service) {
      throw new Error("SAMPLE service not found");
    }
    service.stop();
  }

  async stop() {
    logger.info("*** Stopping SAMPLE service instance ***");
  }
}

export default SampleService;
