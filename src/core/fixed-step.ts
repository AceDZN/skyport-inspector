/** Carry fractional render time forward; physics never receives a tiny remainder. */
export class FixedStepClock {
    readonly dt: number;
    private remainder = 0;
    constructor(hz = 120, private maxSeconds = 8) { this.dt = 1 / hz; }
    add(milliseconds: number) {
        if (Number.isFinite(milliseconds) && milliseconds > 0)
            this.remainder = Math.min(this.maxSeconds, this.remainder + milliseconds / 1000);
    }
    take() {
        if (this.remainder + 1e-12 < this.dt) return undefined;
        this.remainder = Math.max(0, this.remainder - this.dt);
        return this.dt;
    }
    reset() { this.remainder = 0; }
}
