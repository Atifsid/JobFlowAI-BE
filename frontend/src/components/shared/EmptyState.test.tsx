import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchXIcon } from "lucide-react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState icon={SearchXIcon} title="No jobs found" description="Try widening your filters." />);
    expect(screen.getByText("No jobs found")).toBeInTheDocument();
    expect(screen.getByText("Try widening your filters.")).toBeInTheDocument();
  });

  it("renders without a description when none is given", () => {
    render(<EmptyState icon={SearchXIcon} title="No jobs found" />);
    expect(screen.getByText("No jobs found")).toBeInTheDocument();
  });

  it("renders the action node when given", () => {
    render(<EmptyState icon={SearchXIcon} title="No jobs found" action={<button>Clear filters</button>} />);
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });
});
