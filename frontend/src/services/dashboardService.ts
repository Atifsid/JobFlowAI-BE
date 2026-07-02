import { request } from "./api";
import type { Dashboard } from "../types";

export const dashboardService = {
  getDashboard: () => request<Dashboard>("/api/dashboard")
};
