/**
 * Timer service — pure logic for timer state transitions.
 * No side effects, fully testable.
 */

export interface TimerSnapshot {
  elapsed: number; // seconds elapsed
  startedAt: number | null; // epoch ms when last started
  status: "idle" | "running" | "paused" | "completed";
}

/**
 * Compute current elapsed time from a running snapshot.
 */
export function computeElapsed(
  snapshot: TimerSnapshot,
  now: number = Date.now(),
): number {
  if (snapshot.status !== "running" || snapshot.startedAt === null) {
    return snapshot.elapsed;
  }
  const additional = Math.floor((now - snapshot.startedAt) / 1000);
  return snapshot.elapsed + additional;
}

/**
 * Start or resume a timer.
 */
export function startTimer(
  snapshot: TimerSnapshot,
  now: number = Date.now(),
): TimerSnapshot {
  if (snapshot.status === "running") return snapshot;
  return {
    ...snapshot,
    status: "running",
    startedAt: now,
  };
}

/**
 * Pause a running timer.
 */
export function pauseTimer(
  snapshot: TimerSnapshot,
  now: number = Date.now(),
): TimerSnapshot {
  if (snapshot.status !== "running") return snapshot;
  return {
    elapsed: computeElapsed(snapshot, now),
    startedAt: null,
    status: "paused",
  };
}

/**
 * Stop / reset a timer.
 */
export function stopTimer(): TimerSnapshot {
  return {
    elapsed: 0,
    startedAt: null,
    status: "idle",
  };
}

/**
 * Check if a timed task timer has reached the required duration.
 */
export function hasReachedRequiredDuration(
  elapsed: number,
  requiredDuration: number | null,
): boolean {
  if (requiredDuration === null) return false;
  return elapsed >= requiredDuration;
}
