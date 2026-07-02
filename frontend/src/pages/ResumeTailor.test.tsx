import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResumeTailor from "./ResumeTailor";
import { useResume } from "../hooks/useResume";

vi.mock("../hooks/useResume");

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/jobs/1/resume"]}>
      <Routes>
        <Route path="/jobs/:id/resume" element={<ResumeTailor />} />
      </Routes>
    </MemoryRouter>
  );

describe("ResumeTailor", () => {
  it("shows a generate button before a resume exists", () => {
    vi.mocked(useResume).mockReturnValue({ resume: null, generating: false, error: null, generate: vi.fn() });
    renderPage();
    expect(screen.getByText("Generate Tailored Resume")).toBeInTheDocument();
  });

  it("calls generate() when the button is clicked", () => {
    const generate = vi.fn();
    vi.mocked(useResume).mockReturnValue({ resume: null, generating: false, error: null, generate });
    renderPage();
    fireEvent.click(screen.getByText("Generate Tailored Resume"));
    expect(generate).toHaveBeenCalled();
  });

  it("shows the download link once a resume is generated", () => {
    vi.mocked(useResume).mockReturnValue({ resume: { pdfPath: "storage/resumes/generated/a.pdf" }, generating: false, error: null, generate: vi.fn() });
    renderPage();
    expect(screen.getByText("View PDF").closest("a")).toHaveAttribute("href", "/files/resumes/a.pdf");
  });
});
