import { env } from "../../config/env";
import { AIProvider } from "./ai.types";
import OllamaProvider from "./providers/ollama.provider";

class ProviderFactory {
  static get(): AIProvider {
    switch (env.AI_PROVIDER) {
      case "ollama":
      default:
        return new OllamaProvider();
    }
  }
}

export default ProviderFactory;