import { createHash } from "node:crypto";

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  const realIp = request.headers.get("x-real-ip")?.trim();
  const vercelForwardedFor = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();

  const rawIdentifier =
    forwardedFor ??
    vercelForwardedFor ??
    realIp ??
    cloudflareIp ??
    "local-development";

  return `ip:${hashIdentifier(rawIdentifier)}`;
}
