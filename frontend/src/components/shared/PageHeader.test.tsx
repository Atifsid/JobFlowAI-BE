import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as a level-1 heading", () => {
    render(<PageHeader title="Job Search" />);
    expect(screen.getByRole("heading", { level: 1, name: "Job Search" })).toBeInTheDocument();
  });

  it("renders the description when given", () => {
    render(<PageHeader title="Referral Draft" description="Drafts only — nothing sends automatically." />);
    expect(screen.getByText("Drafts only — nothing sends automatically.")).toBeInTheDocument();
  });

  it("renders the actions slot", () => {
    render(<PageHeader title="Dashboard" actions={<button>Search Jobs</button>} />);
    expect(screen.getByRole("button", { name: "Search Jobs" })).toBeInTheDocument();
  });
});
