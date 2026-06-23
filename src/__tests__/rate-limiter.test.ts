import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InMemoryRateLimiter } from '../lib/rate-limiter';

describe('InMemoryRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const limiter = new InMemoryRateLimiter(3, 1000);
    const ip = '192.168.1.1';

    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(false);
  });

  it('blocks requests exceeding the limit', () => {
    const limiter = new InMemoryRateLimiter(2, 1000);
    const ip = '192.168.1.2';

    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(true); // Exceeds limit
  });

  it('resets window after expiry time', () => {
    const limiter = new InMemoryRateLimiter(2, 1000);
    const ip = '192.168.1.3';

    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(false);
    expect(limiter.isRateLimited(ip)).toBe(true); // Blocked

    // Advance time by 1001ms
    vi.advanceTimersByTime(1001);

    expect(limiter.isRateLimited(ip)).toBe(false); // Allowed again
  });

  it('isolates different IP addresses', () => {
    const limiter = new InMemoryRateLimiter(1, 1000);
    const ipA = '192.168.1.4';
    const ipB = '192.168.1.5';

    expect(limiter.isRateLimited(ipA)).toBe(false);
    expect(limiter.isRateLimited(ipA)).toBe(true); // blocked A

    expect(limiter.isRateLimited(ipB)).toBe(false); // B still allowed
    expect(limiter.isRateLimited(ipB)).toBe(true); // blocked B
  });
});
