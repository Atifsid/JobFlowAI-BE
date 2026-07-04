import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchIcon } from "lucide-react";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Jobs Searched" value={47} icon={SearchIcon} />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("Jobs Searched")).toBeInTheDocument();
  });

  it("renders a string value as-is", () => {
    render(<StatCard label="Avg. Match Score" value="68" icon={SearchIcon} />);
    expect(screen.getByText("68")).toBeInTheDocument();
  });

  it("applies a tone-specific class to the value when a tone is given", () => {
    const { container: defaultContainer } = render(<StatCard label="A" value={1} icon={SearchIcon} />);
    const { container: successContainer } = render(<StatCard label="B" value={2} icon={SearchIcon} tone="success" />);
    const defaultValueClass = screen.getByText("1").className;
    const successValueClass = successContainer.querySelector("p")?.className;
    expect(successValueClass).not.toEqual(defaultValueClass);
  });
});
