const SCHOOL_PRIDE_COLORS = ["#6C5CE7", "#00CEC9"];

export async function fireSchoolPride(durationMs = 1000): Promise<void> {
  if (typeof window === "undefined") return;

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const confetti = (await import("canvas-confetti")).default;

  const end = Date.now() + durationMs;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: SCHOOL_PRIDE_COLORS,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: SCHOOL_PRIDE_COLORS,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
