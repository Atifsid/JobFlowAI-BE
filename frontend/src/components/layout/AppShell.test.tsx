import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { dashboardService } from "@/services/dashboardService";
import AppShell from "./AppShell";

vi.mock("@/services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn().mockResolvedValue({ total: 0, referral: 0, directApply: 0, skip: 0, jobs: [] }) },
}));

describe("AppShell", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockClear();
  });

  it("renders the sidebar nav, header, and the routed page content", () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="search" element={<p>Search Page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Search Page")).toBeInTheDocument();
    expect(screen.getAllByText("Job Search").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tracker").length).toBeGreaterThan(0);
  });
});
