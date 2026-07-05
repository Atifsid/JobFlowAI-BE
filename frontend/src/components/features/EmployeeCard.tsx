import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import type { Employee } from "../../types";

interface EmployeeCardProps {
  employee: Employee;
  jobId: string;
}

export default function EmployeeCard({ employee, jobId }: EmployeeCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <InitialsAvatar name={employee.name} size="lg" />
        <p className="text-sm font-medium text-foreground">{employee.name}</p>
        <p className="text-xs text-muted-foreground">
          {employee.title} @ {employee.company}
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" render={<a href={employee.linkedin} target="_blank" rel="noreferrer" />}>
            View LinkedIn
          </Button>
          <Button size="sm" render={<Link to={`/jobs/${jobId}/referral`} />}>
            Draft Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
