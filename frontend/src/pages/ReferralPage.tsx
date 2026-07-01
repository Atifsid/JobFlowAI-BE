import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { ReferralDraft } from "../types";

export default function ReferralPage() {
  const { id } = useParams<{ id: string }>();
  const [drafts, setDrafts] = useState<ReferralDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setDrafts(await api.generateReferrals(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referral drafting failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (linkedin: string, message: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedFor(linkedin);
    setTimeout(() => setCopiedFor(null), 2000);
  };

  return (
    <div>
      <h1>Referral Drafts</h1>
      <p>These are drafts only - copy and send manually, nothing here sends automatically.</p>
      <button onClick={onGenerate} disabled={loading}>
        {loading ? "Drafting..." : "Find Employees & Draft Referrals"}
      </button>

      {error && <p role="alert">{error}</p>}

      {drafts && (
        <ul>
          {drafts.map(({ employee, message }) => (
            <li key={employee.linkedin}>
              <strong>{employee.name}</strong> ({employee.title})
              <pre>{message}</pre>
              <button onClick={() => copy(employee.linkedin, message)}>
                {copiedFor === employee.linkedin ? "Copied!" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
