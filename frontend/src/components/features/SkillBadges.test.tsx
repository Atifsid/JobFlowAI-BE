import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillBadges from "./SkillBadges";
import type { ResumeScore } from "../../types";

const score: ResumeScore = {
  score: 68,
  missingSkills: ["Go", "Kubernetes"],
  strengths: ["Matched: React", "Matched: TypeScript"],
  weaknesses: ["Missing: Go", "Missing: Kubernetes"],
  recommendation: "Apply"
};

describe("SkillBadges", () => {
  it("shows matched skills with the 'Matched: ' prefix stripped", () => {
    render(<SkillBadges score={score} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows missing skills from missingSkills", () => {
    render(<SkillBadges score={score} />);
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });
});
