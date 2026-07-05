import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecentJobsList from "./RecentJobsList";
import type { JobPipeline } from "@/types";

function makePipeline(id: string, postedAt: string): JobPipeline {
  return {
    job: {
      id, title: `Job ${id}`, company: "Acme", location: "NYC", remote: false,
      description: "", skills: [], applyUrl: "https://x.com", source: "test", postedAt
    },
    status: "DISCOVERED"
  };
}

describe("RecentJobsList", () => {
  it("shows skeleton placeholders while loading", () => {
    const { container } = render(<MemoryRouter><RecentJobsList jobs={[]} loading={true} /></MemoryRouter>);
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no jobs and not loading", () => {
    render(<MemoryRouter><RecentJobsList jobs={[]} loading={false} /></MemoryRouter>);
    expect(screen.getByText("No jobs tracked yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Search Jobs" })).toHaveAttribute("href", "/search");
  });

  it("sorts by postedAt descending and caps at 6", () => {
    const jobs = Array.from({ length: 8 }, (_, i) => makePipeline(String(i), `2026-07-${String(i + 1).padStart(2, "0")}`));
    render(<MemoryRouter><RecentJobsList jobs={jobs} loading={false} /></MemoryRouter>);
    const rendered = screen.getAllByRole("link").map(a => a.getAttribute("href"));
    expect(rendered).toEqual(["/jobs/7", "/jobs/6", "/jobs/5", "/jobs/4", "/jobs/3", "/jobs/2"]);
  });
});
