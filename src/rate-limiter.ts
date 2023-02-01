import { singleton } from "tsyringe";

@singleton()
export class RateLimiter {
  private hasAlreadyLimited = false;
  public shouldRateLimit(): boolean {
    if (!this.hasAlreadyLimited) {
      this.hasAlreadyLimited = true;
      return true;
    }
    return false;
  }
}
