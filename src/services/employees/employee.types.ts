export interface Employee {
  name: string;
  title: string;
  company: string;
  linkedin: string;
}

export interface EmployeeProvider {
  find(company: string): Promise<Employee[]>;
}