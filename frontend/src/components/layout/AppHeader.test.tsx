import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "./AppHeader";

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
  it("renders the sidebar trigger and the breadcrumb trail", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
