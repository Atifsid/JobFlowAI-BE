import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { dashboardService } from "@/services/dashboardService";
import AppHeader from "./AppHeader";

vi.mock("@/services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn().mockResolvedValue({ total: 0, referral: 0, directApply: 0, skip: 0, jobs: [] }) },
}));

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <SidebarProvider>
        <AppHeader />
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe("AppHeader", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockClear();
  });

  it("renders the sidebar trigger and the breadcrumb trail", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("opens the command palette when the search button is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /search jobs/i }));
    expect(screen.getByPlaceholderText("Search tracked jobs...")).toBeInTheDocument();
  });
});
