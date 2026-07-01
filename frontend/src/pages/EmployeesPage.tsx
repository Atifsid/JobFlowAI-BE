import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Employee } from "../types";

export default function EmployeesPage() {
  const { id } = useParams<{ id: string }>();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFind = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setEmployees(await api.findEmployees(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Employee lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Employees</h1>
      <button onClick={onFind} disabled={loading}>
        {loading ? "Searching LinkedIn..." : "Find Employees"}
      </button>

      {error && <p role="alert">{error}</p>}

      {employees && (
        <ul>
          {employees.map(employee => (
            <li key={employee.linkedin}>
              <a href={employee.linkedin} target="_blank" rel="noreferrer">{employee.name}</a>
              {" - "}
              {employee.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
