import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { success, failure } from "../../src/utils/api-response";

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("success", () => {
  it("wraps data in the standard envelope with a 200 default", () => {
    const res = mockResponse();

    success(res, { foo: "bar" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
      data: { foo: "bar" }
    });
  });

  it("allows overriding the message and status", () => {
    const res = mockResponse();

    success(res, null, "Created", 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: null
    });
  });
});

describe("failure", () => {
  it("wraps an error in the standard envelope with a 500 default", () => {
    const res = mockResponse();

    failure(res, "Something went wrong");

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: undefined
    });
  });

  it("allows overriding the status and passing an error payload", () => {
    const res = mockResponse();

    failure(res, "Not found", 404, { code: "NOT_FOUND" });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not found",
      error: { code: "NOT_FOUND" }
    });
  });
});
