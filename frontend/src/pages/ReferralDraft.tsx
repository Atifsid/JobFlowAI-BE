import { useParams } from "react-router-dom";
import { useState } from "react";
import { useReferral } from "../hooks/useReferral";
import { referralService } from "../services/referralService";
import PageHeader from "@/components/shared/PageHeader";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Employee } from "../types";

type SentState = "sending" | "sent" | "error";

export default function ReferralDraft() {
  const { id } = useParams<{ id: string }>();
  const { drafts, loading, error, generate } = useReferral(id);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [sentState, setSentState] = useState<Record<string, SentState>>({});

  const copy = async (linkedin: string, message: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedFor(linkedin);
    setTimeout(() => setCopiedFor(null), 2000);
  };

  const markSent = async (employee: Employee) => {
    if (!id) return;
    setSentState(prev => ({ ...prev, [employee.linkedin]: "sending" }));
    try {
      await referralService.markSent(id, employee);
      setSentState(prev => ({ ...prev, [employee.linkedin]: "sent" }));
    } catch {
      setSentState(prev => ({ ...prev, [employee.linkedin]: "error" }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Referral Draft"
        description="These are drafts only — copy and send manually, then mark each one sent to track the follow-up."
        actions={
          <>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Drafting..." : "Find Employees & Draft Referrals"}
            </Button>
            {drafts && (
              <Button variant="outline" onClick={generate} disabled={loading}>
                Regenerate
              </Button>
            )}
          </>
        }
      />

      {error && <p role="alert">{error}</p>}

      <div className="flex flex-col gap-4">
        {drafts?.map(({ employee, message }) => {
          const sent = sentState[employee.linkedin];

          return (
            <Card key={employee.linkedin}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={employee.name} />
                  <p className="text-sm font-medium text-foreground">
                    {employee.name} ({employee.title})
                  </p>
                </div>
                <Textarea readOnly value={message} className="min-h-24 resize-none" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={cn("text-xs", message.length > 200 ? "text-destructive" : "text-muted-foreground")}>
                    {message.length}/200
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copy(employee.linkedin, message)}>
                      {copiedFor === employee.linkedin ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => markSent(employee)}
                      disabled={sent === "sending" || sent === "sent"}
                    >
                      {sent === "sent" ? "Sent ✓" : sent === "sending" ? "Marking…" : "Mark as sent"}
                    </Button>
                  </div>
                </div>
                {sent === "error" && (
                  <p role="alert" className="text-xs text-destructive">
                    Couldn't record the send — try again.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
