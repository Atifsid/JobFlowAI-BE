import Badge from "../common/Badge";
import type { ResumeScore } from "../../types";

interface SkillBadgesProps {
  score: ResumeScore;
}

export default function SkillBadges({ score }: SkillBadgesProps) {
  const matched = score.strengths.map(s => s.replace(/^Matched:\s*/, ""));

  return (
    <div className="skill-badges">
      <div>
        <p className="text-small">Matched</p>
        {matched.map(skill => (
          <Badge key={skill} tone="success">{skill}</Badge>
        ))}
      </div>
      <div>
        <p className="text-small">Missing</p>
        {score.missingSkills.map(skill => (
          <Badge key={skill} tone="neutral">{skill}</Badge>
        ))}
      </div>
    </div>
  );
}
