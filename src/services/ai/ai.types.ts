export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AIProvider {
  chat(messages: AIMessage[]): Promise<string>;
}