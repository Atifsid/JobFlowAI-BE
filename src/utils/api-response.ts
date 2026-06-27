import { Response } from "express";
import { ApiResponse } from "../types/api-response";

export const success = <T>(res: Response, data: T, message = "Success", status = 200) => {
  const response: ApiResponse<T> = { success: true, message, data };
  return res.status(status).json(response);
};

export const failure = (res: Response, message = "Something went wrong", status = 500, error?: any) => {
  return res.status(status).json({ success: false, message, error });
};