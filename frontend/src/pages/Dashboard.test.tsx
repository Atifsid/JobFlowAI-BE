import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useDashboard } from "../hooks/useDashboard";

vi.mock("../hooks/useDashboard");

describe("Dashboard", () => {
  it("renders stat cards and recent jobs", () => {
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: {
        total: 47, referral: 12, directApply: 8, skip: 27,
        jobs: [{
          job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test", postedAt: "2026-01-01" },
          score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
          decision: "DIRECT_APPLY", actions: [], status: "ANALYZED"
        }]
      },
      loading: false,
      error: null
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("shows the error message when loading fails", () => {
    vi.mocked(useDashboard).mockReturnValue({ dashboard: null, loading: false, error: "network down" });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("network down");
  });
});
