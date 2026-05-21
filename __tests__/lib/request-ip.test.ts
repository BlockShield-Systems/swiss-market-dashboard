/** @jest-environment node */
import { createHash } from "node:crypto";
import { getClientIdentifier } from "@/lib/request-ip";

function expectedIdentifier(value: string) {
  return `ip:${createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
}

function createRequest(headers: HeadersInit = {}) {
  return new Request("https://dashboard.ai-techart.com/api/test", {
    headers,
  });
}

describe("getClientIdentifier", () => {
  it("uses the first x-forwarded-for value", () => {
    const request = createRequest({
      "x-forwarded-for": "203.0.113.10, 198.51.100.20",
    });

    expect(getClientIdentifier(request)).toBe(expectedIdentifier("203.0.113.10"));
  });

  it("uses x-vercel-forwarded-for when x-forwarded-for is missing", () => {
    const request = createRequest({
      "x-vercel-forwarded-for": "198.51.100.42",
      "x-real-ip": "203.0.113.99",
    });

    expect(getClientIdentifier(request)).toBe(expectedIdentifier("198.51.100.42"));
  });

  it("uses x-real-ip when forwarded headers are missing", () => {
    const request = createRequest({
      "x-real-ip": "203.0.113.77",
      "cf-connecting-ip": "198.51.100.77",
    });

    expect(getClientIdentifier(request)).toBe(expectedIdentifier("203.0.113.77"));
  });

  it("uses cf-connecting-ip when no other client IP header exists", () => {
    const request = createRequest({
      "cf-connecting-ip": "198.51.100.88",
    });

    expect(getClientIdentifier(request)).toBe(expectedIdentifier("198.51.100.88"));
  });

  it("falls back to local-development without exposing raw identifiers", () => {
    const request = createRequest();

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe(expectedIdentifier("local-development"));
    expect(identifier).toMatch(/^ip:[a-f0-9]{32}$/);
    expect(identifier).not.toContain("local-development");
  });
});
