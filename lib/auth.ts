import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export const SESSION_COOKIE_NAME = "prado_fleet_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, keyHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !keyHex) {
    return false;
  }

  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = (await scryptAsync(password, salt, storedKey.length)) as Buffer;
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

export function safeRedirectPath(pathname: string | null) {
  return pathname?.startsWith("/dashboard") ? pathname : "/dashboard";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}