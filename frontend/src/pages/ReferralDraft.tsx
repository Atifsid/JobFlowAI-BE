import { useParams } from "react-router-dom";
import { useState } from "react";
import { useReferral } from "../hooks/useReferral";
import PageHeader from "@/components/shared/PageHeader";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Referral Draft"
        description="These are drafts only — copy and send manually, nothing here sends automatically."
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
        {drafts?.map(({ employee, message }) => (
          <Card key={employee.linkedin}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={employee.name} />
                <p className="text-sm font-medium text-foreground">
                  {employee.name} ({employee.title})
                </p>
              </div>
              <Textarea readOnly value={message} className="min-h-24 resize-none" />
              <div className="flex items-center justify-between">
                <p className={cn("text-xs", message.length > 300 ? "text-destructive" : "text-muted-foreground")}>
                  {message.length}/300
                </p>
                <Button variant="outline" size="sm" onClick={() => copy(employee.linkedin, message)}>
                  {copiedFor === employee.linkedin ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
