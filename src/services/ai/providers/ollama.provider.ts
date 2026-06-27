import axios from "axios";
import { env } from "../../../config/env";
import { AIMessage, AIProvider } from "../ai.types";

export default class OllamaProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    const { data } = await axios.post(`${env.OLLAMA_URL}/api/chat`, {
      model: "qwen2.5-coder:7b",
      stream: false,
      messages
    });

    return data.message.content;
  }
}