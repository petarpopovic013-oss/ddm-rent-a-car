import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RateLimitOptions = {
  scope: string;
  limit: number;
  windowSeconds: number;
  subject?: string;
  bindToRequest?: boolean;
};

function rateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("RATE_LIMIT_SECRET ili ADMIN_SESSION_SECRET mora imati najmanje 32 karaktera.");
  }
  return secret;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

async function requestIdentity() {
  const requestHeaders = await headers();
  const ip = firstHeaderValue(requestHeaders.get("cf-connecting-ip"))
    ?? firstHeaderValue(requestHeaders.get("x-vercel-forwarded-for"))
    ?? firstHeaderValue(requestHeaders.get("x-real-ip"))
    ?? firstHeaderValue(requestHeaders.get("x-forwarded-for"))
    ?? "unknown";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? "unknown";
  return `${ip}|${userAgent}`;
}

function hashIdentifier(value: string) {
  return createHmac("sha256", rateLimitSecret()).update(value).digest("hex");
}

export async function consumeRateLimit({
  scope,
  limit,
  windowSeconds,
  subject,
  bindToRequest = true,
}: RateLimitOptions) {
  const identity = await requestIdentity();
  const identifier = subject && !bindToRequest
    ? subject
    : subject
      ? `${identity}|${subject}`
      : identity;
  const keyHash = hashIdentifier(identifier);
  const { data, error } = await getSupabaseAdmin().rpc("rc_consume_rate_limit", {
    p_scope: scope,
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_max_attempts: limit,
  });

  if (error) {
    console.error("Rate limit check failed", { scope, code: error.code });
    return false;
  }
  return data === true;
}
