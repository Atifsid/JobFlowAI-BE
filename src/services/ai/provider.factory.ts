import { env } from "../../config/env";
import { AIProvider } from "./ai.types";
import OllamaProvider from "./providers/ollama.provider";
import AnthropicProvider from "./providers/anthropic.provider";

class ProviderFactory {
  static get(): AIProvider {
    switch (env.AI_PROVIDER) {
      case "ollama":
        return new OllamaProvider();
      case "claude":
      default:
        return new AnthropicProvider();
    }
  }
}

export default ProviderFactory;