import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

describe("Layout", () => {
  it("renders nav links and the routed page content", () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/" element={<Layout />}>
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
