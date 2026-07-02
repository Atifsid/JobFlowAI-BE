import { request } from "./api";
import type { Employee } from "../types";

export const employeeService = {
  find: (jobId: string) => request<Employee[]>(`/api/employees/find/${jobId}`, { method: "POST" })
};
