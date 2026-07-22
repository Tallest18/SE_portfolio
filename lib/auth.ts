import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "portfolio_admin_session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to your .env.local file (see .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Creates a signed session token that expires in 7 days. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

/** Verifies a session token. Returns true if it's valid and unexpired. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}
