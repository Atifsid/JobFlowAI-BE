import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreCircle from "./ScoreCircle";

describe("ScoreCircle", () => {
  it("renders the score as text and an accessible label", () => {
    render(<ScoreCircle score={68} />);
    expect(screen.getByText("68")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Score 68 out of 100" })).toBeInTheDocument();
  });
});
