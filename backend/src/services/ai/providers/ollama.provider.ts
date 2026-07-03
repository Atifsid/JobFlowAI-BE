import axios from "axios";
import { env } from "../../../config/env";
import { AIMessage, AIProvider } from "../ai.types";

export default class OllamaProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    const { data } = await axios.post(`${env.OLLAMA_URL}/api/chat`, {
      model: env.OLLAMA_MODEL,
      stream: false,
      messages
    });

    return data.message.content;
  }
}