import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactCard from "./ContactCard";

const employee = { name: "Sarah Chen", title: "Staff Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("ContactCard", () => {
  it("renders the employee's name, title, company, and a LinkedIn link", () => {
    render(<ContactCard employee={employee} />);

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer @ Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View LinkedIn" })).toHaveAttribute("href", "https://linkedin.com/in/sarah");
  });
});
