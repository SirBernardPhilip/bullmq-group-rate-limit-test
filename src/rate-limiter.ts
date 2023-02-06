export class RateLimiter {
	private static instance: RateLimiter;

	public static getInstance(): RateLimiter {
		if (!this.instance) {
			this.instance = new RateLimiter();
		}
		return this.instance;
	}

	private hasAlreadyLimited = false;
	public shouldRateLimit(): boolean {
		if (!this.hasAlreadyLimited) {
			this.hasAlreadyLimited = true;
			return true;
		}
		return false;
	}
}
