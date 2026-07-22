import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "ddm_rc_admin";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function sessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET mora imati najmanje 32 karaktera.");
  }
  return new TextEncoder().encode(secret);
}

async function createToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("ddm-rentacar-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(sessionKey());
}

async function verifyToken(value?: string) {
  if (!value) return false;
  try {
    const { payload } = await jwtVerify(value, sessionKey(), {
      algorithms: ["HS256"],
      subject: "ddm-rentacar-admin",
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export const hasAdminSession = cache(async () => {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return verifyToken(value);
});

export async function requireAdmin() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  return { role: "admin" as const };
}
