import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  }
}));

import AnthropicProvider from "../../../../src/services/ai/providers/anthropic.provider";

describe("AnthropicProvider.chat", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("splits system messages into the top-level system param", async () => {
    createMock.mockResolvedValue({
      content: [{ type: "text", text: "Hello there" }]
    });

    const provider = new AnthropicProvider();
    const result = await provider.chat([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hi" }
    ]);

    expect(result).toBe("Hello there");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "You are a helpful assistant.",
        messages: [{ role: "user", content: "Hi" }]
      })
    );
  });

  it("joins multiple system messages and omits system when there are none", async () => {
    createMock.mockResolvedValue({
      content: [{ type: "text", text: "ok" }]
    });

    const provider = new AnthropicProvider();
    await provider.chat([{ role: "user", content: "Hi" }]);

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: undefined,
        messages: [{ role: "user", content: "Hi" }]
      })
    );
  });

  it("concatenates multiple text content blocks", async () => {
    createMock.mockResolvedValue({
      content: [
        { type: "text", text: "Part one. " },
        { type: "text", text: "Part two." }
      ]
    });

    const provider = new AnthropicProvider();
    const result = await provider.chat([{ role: "user", content: "Hi" }]);

    expect(result).toBe("Part one. Part two.");
  });
});
