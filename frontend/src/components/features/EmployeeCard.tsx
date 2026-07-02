import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import type { Employee } from "../../types";

interface EmployeeCardProps {
  employee: Employee;
  jobId: string;
}

export default function EmployeeCard({ employee, jobId }: EmployeeCardProps) {
  return (
    <Card>
      <p className="text-heading">{employee.name}</p>
      <p className="text-body">
        {employee.title} @ {employee.company}
      </p>
      <div className="employee-card__actions">
        <a href={employee.linkedin} target="_blank" rel="noreferrer">
          <Button variant="secondary">View LinkedIn</Button>
        </a>
        <Link to={`/jobs/${jobId}/referral`}>
          <Button>Draft Message</Button>
        </Link>
      </div>
    </Card>
  );
}
