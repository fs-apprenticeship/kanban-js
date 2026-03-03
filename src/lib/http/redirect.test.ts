import { describe, it, expect } from "vitest";
import { getSiteOrigin, sanitizeNextPath } from "./redirect";

describe("sanitizeNextPath", () => {
  it("returns fallback when next is null/undefined", () => {
    expect(sanitizeNextPath(null, "/")).toBe("/");
    expect(sanitizeNextPath(undefined, "/home")).toBe("/home");
  });

  it("allows normal relative paths", () => {
    expect(sanitizeNextPath("/projects", "/")).toBe("/projects");
    expect(sanitizeNextPath("/projects/123?x=1", "/")).toBe("/projects/123?x=1");
  });

  it("rejects non-relative paths", () => {
    expect(sanitizeNextPath("https://abc.com", "/")).toBe("/");
    expect(sanitizeNextPath("http://abc.com", "/")).toBe("/");
    expect(sanitizeNextPath("abc", "/")).toBe("/");
  });
});
describe("getSiteOrigin", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(getSiteOrigin("http://localhost:3000")).toBe("https://example.com");
  });

  it("falls back to request origin when env is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });
});