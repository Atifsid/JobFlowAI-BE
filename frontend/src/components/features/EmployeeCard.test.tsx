import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmployeeCard from "./EmployeeCard";
import type { Employee } from "../../types";

const employee: Employee = { name: "Sarah Chen", title: "Senior Engineer", company: "Acme Inc", linkedin: "https://linkedin.com/in/sarahchen" };

describe("EmployeeCard", () => {
  it("renders name, title, company, and a link to draft a referral", () => {
    render(
      <MemoryRouter>
        <EmployeeCard employee={employee} jobId="job-1" />
      </MemoryRouter>
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText(/Senior Engineer @ Acme Inc/)).toBeInTheDocument();
    expect(screen.getByText("Draft Message").closest("a")).toHaveAttribute("href", "/jobs/job-1/referral");
  });
});
