export class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private limit: number,
    private windowMs: number
  ) {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(ip);
        }
      }
    }, 5 * 60 * 1000);
    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  public isRateLimited(ip: string): boolean {
    const now = Date.now();
    const clientData = this.store.get(ip);

    if (!clientData) {
      this.store.set(ip, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + this.windowMs;
      return false;
    }

    if (clientData.count >= this.limit) {
      return true;
    }

    clientData.count++;
    return false;
  }
}
