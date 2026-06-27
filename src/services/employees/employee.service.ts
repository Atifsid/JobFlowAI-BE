import googleProvider from "./providers/google.provider";

class EmployeeService {
  async find(company: string) {
    return googleProvider.find(company);
  }
}

export default new EmployeeService();