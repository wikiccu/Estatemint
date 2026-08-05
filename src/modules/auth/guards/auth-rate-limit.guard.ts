import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60_000;
  private readonly maxAttempts = 10;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    if (this.attempts.size > 1000) {
      for (const [entryKey, entry] of this.attempts) {
        if (entry.resetAt <= now) this.attempts.delete(entryKey);
      }
    }
    const key = `${request.ip ?? request.socket.remoteAddress ?? 'unknown'}:${request.path}`;
    const current = this.attempts.get(key);

    if (current === undefined || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (current.count >= this.maxAttempts) {
      throw new HttpException(
        'Too many authentication attempts. Please wait and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    return true;
  }
}
