import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EmployeeSearch from "./EmployeeSearch";
import { useEmployees } from "../hooks/useEmployees";

vi.mock("../hooks/useEmployees");

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/jobs/1/employees"]}>
      <Routes>
        <Route path="/jobs/:id/employees" element={<EmployeeSearch />} />
      </Routes>
    </MemoryRouter>
  );

describe("EmployeeSearch", () => {
  it("triggers find() when the button is clicked", () => {
    const find = vi.fn();
    vi.mocked(useEmployees).mockReturnValue({ employees: null, loading: false, error: null, find });
    renderPage();
    fireEvent.click(screen.getByText("Find Employees"));
    expect(find).toHaveBeenCalled();
  });

  it("renders one card per employee", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: [{ name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" }],
      loading: false, error: null, find: vi.fn()
    });
    renderPage();
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
  });
});
