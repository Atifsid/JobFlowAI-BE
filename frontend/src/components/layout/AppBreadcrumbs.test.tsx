import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { dashboardService } from "@/services/dashboardService";
import AppBreadcrumbs from "./AppBreadcrumbs";

vi.mock("@/services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn() },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<AppBreadcrumbs />} />
        <Route path="/search" element={<AppBreadcrumbs />} />
        <Route path="/jobs" element={<AppBreadcrumbs />} />
        <Route path="/jobs/:id" element={<AppBreadcrumbs />} />
        <Route path="/jobs/:id/resume" element={<AppBreadcrumbs />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AppBreadcrumbs", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockReset();
  });

  it("shows Dashboard on the root route", () => {
    renderAt("/");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows Job Search on /search", () => {
    renderAt("/search");
    expect(screen.getByText("Job Search")).toBeInTheDocument();
  });

  it("shows Tracker on /jobs", () => {
    renderAt("/jobs");
    expect(screen.getByText("Tracker")).toBeInTheDocument();
  });

  it("shows Tracker > job title on /jobs/:id, using real dashboard data", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, referral: 0, directApply: 1, skip: 0,
      jobs: [{ job: { id: "job-1", title: "Senior Engineer", company: "Acme" }, status: "DISCOVERED" } as never],
    });

    renderAt("/jobs/job-1");

    expect(screen.getByText("Tracker")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Senior Engineer @ Acme")).toBeInTheDocument());
  });

  it("shows Tracker > job title > subpage label on /jobs/:id/resume", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, referral: 0, directApply: 1, skip: 0,
      jobs: [{ job: { id: "job-1", title: "Senior Engineer", company: "Acme" }, status: "DISCOVERED" } as never],
    });

    renderAt("/jobs/job-1/resume");

    await waitFor(() => expect(screen.getByText("Senior Engineer @ Acme")).toBeInTheDocument());
    expect(screen.getByText("Resume Tailor")).toBeInTheDocument();
  });
});
