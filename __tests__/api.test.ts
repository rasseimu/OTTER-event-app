import { buildHeaders } from "@/lib/api";

describe("buildHeaders", () => {
  it("includes Authorization header when token provided", () => {
    const headers = buildHeaders("mytoken");
    expect(headers["Authorization"]).toBe("Bearer mytoken");
  });

  it("omits Authorization header when no token", () => {
    const headers = buildHeaders(undefined);
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("always includes Content-Type", () => {
    expect(buildHeaders(undefined)["Content-Type"]).toBe("application/json");
    expect(buildHeaders("tok")["Content-Type"]).toBe("application/json");
  });
});
