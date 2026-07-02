import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders its children with a neutral tone by default", () => {
    render(<Badge>Skip</Badge>);
    expect(screen.getByText("Skip").className).toContain("badge--neutral");
  });

  it("applies the given tone", () => {
    render(<Badge tone="success">Ready</Badge>);
    expect(screen.getByText("Ready").className).toContain("badge--success");
  });
});
