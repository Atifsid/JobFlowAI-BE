import StatusBadge from "@/components/shared/StatusBadge";

interface SkillBadgesProps {
  matched: string[];
  missing: string[];
}

// Renders the ATS keyword check for a generated resume: which JD
// keywords made it into the tailored resume and which are still missing.
export default function SkillBadges({ matched, missing }: SkillBadgesProps) {
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
          {missing.map(skill => (
            <StatusBadge key={skill} tone="neutral">{skill}</StatusBadge>
          ))}
        </div>
      </div>
    </div>
  );
}
