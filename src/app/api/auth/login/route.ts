import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";

// ---------------------------------------------------------------------------
// In-process rate limiter (sufficient for single-instance portfolio)
// Key: hashed IP address — Value: { count, windowStart }
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5;       // max attempts
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const key = hashIp(ip);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    // New window
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil(
      (RATE_LIMIT_WINDOW - (now - entry.windowStart)) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const ip = getClientIp(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    const storedPassword = process.env.ADMIN_PASSWORD ?? "";

    // 2. Timing-safe comparison — prevents timing attacks
    const inputBuffer = Buffer.from(password);
    const storedBuffer = Buffer.from(storedPassword);

    // Buffers must be the same length for timingSafeEqual
    const maxLen = Math.max(inputBuffer.length, storedBuffer.length);
    const safeInput = Buffer.alloc(maxLen);
    const safeStored = Buffer.alloc(maxLen);
    inputBuffer.copy(safeInput);
    storedBuffer.copy(safeStored);

    const passwordMatch = timingSafeEqual(safeInput, safeStored) &&
      inputBuffer.length === storedBuffer.length;

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    // 3. Session cookie — HttpOnly, Secure, SameSite=Strict
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
