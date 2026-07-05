import axios from "axios";
import { env } from "../../../config/env";
import { AIMessage, AIProvider } from "../ai.types";

export default class OllamaProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    try {
      const { data } = await axios.post(`${env.OLLAMA_URL}/api/chat`, {
        model: env.OLLAMA_MODEL,
        stream: false,
        messages,
        options: {
          // Ollama's default context window (4k) silently truncates long
          // prompts from the top - the model loses the system rules before
          // it loses the job description. 16k fits every prompt this app
          // sends. Low temperature: these are instruction-following tasks,
          // not creative writing.
          num_ctx: 16384,
          temperature: 0.2
        }
      });

      return data.message.content;
    } catch (err: any) {
      // Surface Ollama's own error text (model not pulled, server down,
      // bad request) instead of a bare axios status message.
      const detail = err?.response?.data?.error ?? err?.message ?? "unknown error";
      throw new Error(
        `Ollama request failed (${env.OLLAMA_MODEL} @ ${env.OLLAMA_URL}): ${detail}`,
        { cause: err }
      );
    }
  }
}