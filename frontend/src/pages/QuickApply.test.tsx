import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuickApply from "./QuickApply";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";

vi.mock("../services/resumeService", () => ({ resumeService: { generateAdhoc: vi.fn() } }));
vi.mock("../services/referralService", () => ({ referralService: { generateDraftsAdhoc: vi.fn() } }));

const description = "A".repeat(60);

function fillForm() {
  fireEvent.change(screen.getByLabelText("Job Title"), { target: { value: "Senior Engineer" } });
  fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Acme" } });
  fireEvent.change(screen.getByLabelText("Job Description"), { target: { value: description } });
}

describe("QuickApply", () => {
  it("shows a validation error when the description is too short and does not call the backend", () => {
    render(<QuickApply />);
    fireEvent.change(screen.getByLabelText("Job Title"), { target: { value: "Senior Engineer" } });
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Acme" } });
    fireEvent.change(screen.getByLabelText("Job Description"), { target: { value: "too short" } });

    fireEvent.click(screen.getByText("Run Pipeline"));

    expect(screen.getByRole("alert")).toHaveTextContent("at least 50 characters");
    expect(resumeService.generateAdhoc).not.toHaveBeenCalled();
  });

  it("runs resume generation then referral drafting when Run Pipeline is submitted", async () => {
    vi.mocked(resumeService.generateAdhoc).mockResolvedValue({
      pdfPath: "storage/resumes/generated/a.pdf",
      ats: { score: 80, matchedKeywords: ["React"], missingKeywords: ["AWS"], pages: 1, missingEmployers: [], passed: true }
    });
    vi.mocked(referralService.generateDraftsAdhoc).mockResolvedValue([
      { employee: { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" }, message: "Hey Sarah" }
    ]);

    render(<QuickApply />);
    fillForm();
    fireEvent.click(screen.getByText("Run Pipeline"));

    await waitFor(() => expect(screen.getByText("80% JD keyword match · 1 page")).toBeInTheDocument());
    expect(resumeService.generateAdhoc).toHaveBeenCalledWith({ title: "Senior Engineer", company: "Acme", description });
    expect(referralService.generateDraftsAdhoc).toHaveBeenCalledWith({ title: "Senior Engineer", company: "Acme", driveLink: undefined });
    expect(screen.getByDisplayValue("Hey Sarah")).toBeInTheDocument();
  });

  it("shows an error message when the pipeline fails", async () => {
    vi.mocked(resumeService.generateAdhoc).mockRejectedValue(new Error("Ollama is not running"));

    render(<QuickApply />);
    fillForm();
    fireEvent.click(screen.getByText("Run Pipeline"));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Ollama is not running"));
  });
});
