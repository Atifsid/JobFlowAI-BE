import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useDashboard } from "../hooks/useDashboard";

vi.mock("../hooks/useDashboard");

describe("Dashboard", () => {
  it("renders pipeline-activity stat cards and recent jobs", () => {
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: {
        total: 47, resumesGenerated: 12, referralsReady: 8, applied: 3,
        jobs: [
          {
            job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test", postedAt: "2026-01-02" },
            status: "RESUME_GENERATED"
          },
          {
            job: { id: "2", title: "Staff Engineer", company: "Beta", location: "SF", remote: true, description: "", skills: [], applyUrl: "https://y.com", source: "test", postedAt: "2026-01-01" },
            status: "DISCOVERED"
          }
        ]
      },
      loading: false,
      error: null
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText("Jobs Found")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("Resumes Generated")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Referrals Ready")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("shows the empty state when there are no jobs", () => {
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: { total: 0, resumesGenerated: 0, referralsReady: 0, applied: 0, jobs: [] },
      loading: false,
      error: null
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(screen.getByText("No jobs tracked yet")).toBeInTheDocument();
  });

  it("shows the error message when loading fails", () => {
    vi.mocked(useDashboard).mockReturnValue({ dashboard: null, loading: false, error: "network down" });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("network down");
  });
});
