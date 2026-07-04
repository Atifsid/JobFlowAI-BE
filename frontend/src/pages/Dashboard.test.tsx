import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useDashboard } from "../hooks/useDashboard";

vi.mock("../hooks/useDashboard");

describe("Dashboard", () => {
  it("renders stat cards, the average score, and recent jobs", () => {
    // Two jobs with different scores (68, 50) so the computed average (59)
    // never collides textually with either job's own displayed score —
    // with only one job the average always equals that job's score, which
    // would make getByText ambiguous (matches both the stat card and the row).
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: {
        total: 47, referral: 12, directApply: 8, skip: 27,
        jobs: [
          {
            job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test", postedAt: "2026-01-02" },
            score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
            decision: "DIRECT_APPLY", actions: [], status: "ANALYZED"
          },
          {
            job: { id: "2", title: "Staff Engineer", company: "Beta", location: "SF", remote: true, description: "", skills: [], applyUrl: "https://y.com", source: "test", postedAt: "2026-01-01" },
            score: { score: 50, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
            decision: "SKIP", actions: [], status: "DISCOVERED"
          }
        ]
      },
      loading: false,
      error: null
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument(); // average of 68 and 50, shown only on the stat card
    expect(screen.getByText("68")).toBeInTheDocument(); // Senior Engineer's own row score
    expect(screen.getByText("50")).toBeInTheDocument(); // Staff Engineer's own row score
  });

  it("does not render an average-score card when there are no jobs", () => {
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: { total: 0, referral: 0, directApply: 0, skip: 0, jobs: [] },
      loading: false,
      error: null
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText("No jobs tracked yet")).toBeInTheDocument();
    expect(screen.queryByText("Avg. Match Score")).not.toBeInTheDocument();
  });

  it("shows the error message when loading fails", () => {
    vi.mocked(useDashboard).mockReturnValue({ dashboard: null, loading: false, error: "network down" });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("network down");
  });
});
