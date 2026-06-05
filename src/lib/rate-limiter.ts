/**
 * Simple In-Memory Rate Limiter for Next.js API Routes
 * Note: In a true Kapruka production deployment, this would use Upstash Redis 
 * or a similar distributed cache solution to share state across serverless instances.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(identifier);

  // Clean up or initialize
  if (!record || record.lastReset < windowStart) {
    record = { count: 0, lastReset: now };
  }

  record.count += 1;
  rateLimitMap.set(identifier, record);

  return {
    success: record.count <= limit,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.lastReset + windowMs,
  };
}
