import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("axios", () => ({
  default: { post: mockPost }
}));

describe("OllamaProvider.chat", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPost.mockReset();
  });

  afterEach(() => {
    delete process.env.OLLAMA_MODEL;
    delete process.env.OLLAMA_URL;
  });

  it("sends the configured OLLAMA_MODEL rather than a hardcoded one", async () => {
    process.env.OLLAMA_MODEL = "llama3.1:8b";
    process.env.OLLAMA_URL = "http://localhost:11434";
    mockPost.mockResolvedValue({ data: { message: { content: "hi there" } } });

    const { default: OllamaProvider } = await import(
      "../../../../src/services/ai/providers/ollama.provider"
    );
    const provider = new OllamaProvider();

    const result = await provider.chat([{ role: "user", content: "Hi" }]);

    expect(mockPost).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      expect.objectContaining({ model: "llama3.1:8b", stream: false })
    );
    expect(result).toBe("hi there");
  });
});
