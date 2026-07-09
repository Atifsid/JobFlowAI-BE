import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import type { Employee } from "../../types";

interface ContactCardProps {
  employee: Employee;
}

export default function ContactCard({ employee }: ContactCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <InitialsAvatar name={employee.name} size="lg" />
        <p className="text-sm font-medium text-foreground">{employee.name}</p>
        <p className="text-xs text-muted-foreground">
          {employee.title} @ {employee.company}
        </p>
        <Button variant="outline" size="sm" render={<a href={employee.linkedin} target="_blank" rel="noreferrer" />}>
          View LinkedIn
        </Button>
      </CardContent>
    </Card>
  );
}
