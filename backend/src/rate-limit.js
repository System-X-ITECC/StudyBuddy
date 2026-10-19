/** In-process login abuse brake. Deploy a shared/edge rate limit for multi-instance production. */
export function createRateLimiter({ max = 12, windowMs = 60_000, now = () => Date.now() } = {}) {
  const attempts = new Map();
  let operations = 0;
  return (req, res, next) => {
    const time = now();
    // Use the connection IP, never an untrusted X-Forwarded-For header.
    const key = String(req.ip || req.socket?.remoteAddress || 'unknown');
    if (++operations % 100 === 0 || attempts.size > 10_000) {
      for (const [address, entry] of attempts) if (entry.until <= time) attempts.delete(address);
      if (attempts.size > 10_000) attempts.delete(attempts.keys().next().value);
    }
    const entry = attempts.get(key);
    if (!entry || entry.until <= time) {
      attempts.set(key, { count: 1, until: time + windowMs });
      return next();
    }
    if (entry.count >= max) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((entry.until - time) / 1000))));
      return res.status(429).json({ error: 'Too many attempts. Please try again shortly.' });
    }
    entry.count++;
    next();
  };
}
