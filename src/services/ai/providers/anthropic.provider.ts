import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../../config/env";
import { AIMessage, AIProvider } from "../ai.types";

export default class AnthropicProvider implements AIProvider {
  private client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  async chat(messages: AIMessage[]): Promise<string> {
    const system = messages
      .filter(message => message.role === "system")
      .map(message => message.content)
      .join("\n\n");

    const conversation = messages
      .filter(message => message.role !== "system")
      .map(message => ({
        role: message.role as "user" | "assistant",
        content: message.content
      }));

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: system || undefined,
      messages: conversation
    });

    return response.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("");
  }
}
