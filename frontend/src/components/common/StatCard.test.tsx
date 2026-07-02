import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Jobs Searched" value={47} />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("Jobs Searched")).toBeInTheDocument();
  });
});
