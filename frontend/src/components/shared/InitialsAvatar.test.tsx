import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InitialsAvatar from "./InitialsAvatar";

describe("InitialsAvatar", () => {
  it("renders the first letter of each of the first and last words for multi-word names", () => {
    render(<InitialsAvatar name="Acme Corp" />);
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("renders the first two letters for single-word names", () => {
    render(<InitialsAvatar name="Stripe" />);
    expect(screen.getByText("ST")).toBeInTheDocument();
  });

  it("falls back to a question mark for blank names", () => {
    render(<InitialsAvatar name="   " />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
