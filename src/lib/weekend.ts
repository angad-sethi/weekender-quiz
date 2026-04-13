/**
 * Returns the Saturday date string (YYYY-MM-DD) for the current weekend.
 * Friday 6pm through Sunday 11:59pm all map to the same Saturday.
 */
export function getWeekendKey(now: Date = new Date()): string {
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const hour = now.getHours();

  let saturday: Date;

  if (day === 6) {
    saturday = now;
  } else if (day === 0) {
    saturday = new Date(now);
    saturday.setDate(now.getDate() - 1);
  } else if (day === 5 && hour >= 18) {
    saturday = new Date(now);
    saturday.setDate(now.getDate() + 1);
  } else {
    // Weekday — find the upcoming Saturday
    const daysUntilSat = 6 - day;
    saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSat);
  }

  const y = saturday.getFullYear();
  const m = String(saturday.getMonth() + 1).padStart(2, "0");
  const d = String(saturday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
