import { Buffer } from "node:buffer";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { env } from "../env.js";

const sessionLifetimeSeconds = 60 * 60 * 8;
const sessions = new Map<string, { userId: string; expiresAt: number }>();
const tokenCookieName = "library_session";

type TokenPayload = {
  sub: string;
  sid: string;
  exp: number;
};

export function createSession(userId: string): string {
  const sessionId = randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  sessions.set(sessionId, { userId, expiresAt });
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: userId, sid: sessionId, exp: expiresAt });
  const content = `${header}.${payload}`;
  return `${content}.${sign(content)}`;
}

export function verifySessionToken(token: string): TokenPayload | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return undefined;
  }

  const content = `${parts[0]}.${parts[1]}`;
  const expectedSignature = Buffer.from(sign(content), "base64url");
  const suppliedSignature = Buffer.from(parts[2], "base64url");
  if (expectedSignature.length !== suppliedSignature.length
    || !timingSafeEqual(expectedSignature, suppliedSignature)) {
    return undefined;
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!isTokenPayload(payload) || payload.exp <= Math.floor(Date.now() / 1000)) {
      return undefined;
    }
    const session = sessions.get(payload.sid);
    if (!session || session.userId !== payload.sub || session.expiresAt !== payload.exp) {
      return undefined;
    }
    return payload;
  }
  catch {
    return undefined;
  }
}

export function revokeSessionToken(token: string | undefined): void {
  if (!token) {
    return;
  }

  const payload = verifySessionToken(token);
  if (payload) {
    sessions.delete(payload.sid);
  }
}

export function getSessionCookie(requestCookieHeader: string | undefined): string | undefined {
  if (!requestCookieHeader) {
    return undefined;
  }
  const prefix = `${tokenCookieName}=`;
  const cookie = requestCookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(prefix));
  if (!cookie) {
    return undefined;
  }
  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  }
  catch {
    return undefined;
  }
}

export function setSessionCookie(token: string, secure: boolean): string {
  return `${tokenCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(secure: boolean): string {
  return `${tokenCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

function sign(content: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(content).digest("base64url");
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function isTokenPayload(value: unknown): value is TokenPayload {
  return typeof value === "object"
    && value !== null
    && "sub" in value
    && typeof value.sub === "string"
    && "sid" in value
    && typeof value.sid === "string"
    && "exp" in value
    && typeof value.exp === "number";
}
