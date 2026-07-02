import { useParams } from "react-router-dom";
import { useState } from "react";
import { useReferral } from "../hooks/useReferral";
import Button from "../components/common/Button";

export default function ReferralDraft() {
  const { id } = useParams<{ id: string }>();
  const { drafts, loading, error, generate } = useReferral(id);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  const copy = async (linkedin: string, message: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedFor(linkedin);
    setTimeout(() => setCopiedFor(null), 2000);
  };

  return (
    <div className="page">
      <h1 className="text-display">Referral Draft</h1>
      <p className="text-small">
        These are drafts only — copy and send manually, nothing here sends automatically.
      </p>

      <Button onClick={generate} disabled={loading}>
        {loading ? "Drafting..." : "Find Employees & Draft Referrals"}
      </Button>
      {drafts && (
        <Button variant="secondary" onClick={generate} disabled={loading}>
          Regenerate
        </Button>
      )}

      {error && <p role="alert">{error}</p>}

      {drafts?.map(({ employee, message }) => (
        <div key={employee.linkedin} className="referral-draft">
          <p className="text-heading">
            {employee.name} ({employee.title})
          </p>
          <textarea readOnly value={message} className="referral-draft__editor" />
          <p className="text-small">{message.length}/300</p>
          <Button variant="secondary" onClick={() => copy(employee.linkedin, message)}>
            {copiedFor === employee.linkedin ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      ))}
    </div>
  );
}
