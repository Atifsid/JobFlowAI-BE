import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>,
  );
}

describe("AppSidebar", () => {
  it("renders all three top-level nav links", () => {
    renderAt("/");
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /job search/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tracker/i })).toBeInTheDocument();
  });

  it("marks the Job Search link as the current page when on /search", () => {
    renderAt("/search");
    expect(screen.getByRole("link", { name: /job search/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks the Dashboard link as current only on the exact root path", () => {
    renderAt("/jobs");
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: /tracker/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
