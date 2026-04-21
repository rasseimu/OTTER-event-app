/**
 * @jest-environment node
 */
import { proxy as middleware } from "@/proxy";
import { NextRequest } from "next/server";

function makeRequest(path: string, token?: string) {
  const req = new NextRequest(`http://localhost:3000${path}`);
  if (token) req.cookies.set("token", token);
  return req;
}

describe("middleware", () => {
  it("redirects to /login when no token on protected route", () => {
    const res = middleware(makeRequest("/"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows access to protected route with token", () => {
    const res = middleware(makeRequest("/", "sometoken"));
    expect(res.status).toBe(200);
  });

  it("redirects authenticated user away from /login", () => {
    const res = middleware(makeRequest("/login", "sometoken"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/");
  });
});
