import StatusBadge from "@/components/shared/StatusBadge";
import type { ResumeScore } from "../../types";

interface SkillBadgesProps {
  score: ResumeScore;
}

export default function SkillBadges({ score }: SkillBadgesProps) {
  const matched = score.strengths.map(s => s.replace(/^Matched:\s*/, ""));

  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex min-w-40 flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">Matched</p>
        <div className="flex flex-wrap gap-1">
          {matched.map(skill => (
            <StatusBadge key={skill} tone="success">{skill}</StatusBadge>
          ))}
        </div>
      </div>
      <div className="flex min-w-40 flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">Missing</p>
        <div className="flex flex-wrap gap-1">
          {score.missingSkills.map(skill => (
            <StatusBadge key={skill} tone="neutral">{skill}</StatusBadge>
          ))}
        </div>
      </div>
    </div>
  );
}
