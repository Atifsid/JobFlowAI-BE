import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skeleton from "./Skeleton";

describe("Skeleton", () => {
  it("renders a status placeholder", () => {
    render(<Skeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
