import { Employee } from "./employee.model";

export interface Referral {
  employee: Employee;
  message: string;
  sent: boolean;
  replied: boolean;
}