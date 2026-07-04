import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders its children", () => {
    render(<StatusBadge tone="success">Applied</StatusBadge>);
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("applies a different class per tone", () => {
    const { container: successContainer } = render(<StatusBadge tone="success">A</StatusBadge>);
    const { container: errorContainer } = render(<StatusBadge tone="error">B</StatusBadge>);
    const successClass = successContainer.querySelector("span")?.className;
    const errorClass = errorContainer.querySelector("span")?.className;
    expect(successClass).not.toEqual(errorClass);
  });
});
