export default function durationFormat(mill: number): string {
  const seconds = Math.floor(mill / 1000);
  // Seconds
  if (seconds < 60) {
    return `${seconds}s`;
  }
  // Minutes
  if (seconds < 60 * 60) {
    return `${Math.floor(seconds / 60)}m`;
  }
  // Hours
  if (seconds < 60 * 60 * 24) {
    return `${Math.floor(seconds / (60 * 60))}h`;
  }
  // Days
  if (seconds < 60 * 60 * 24 * 7) {
    return `${Math.floor(seconds / (60 * 60 * 24))}d`;
  }
  // Weeks
  return `${Math.floor(seconds / (60 * 60 * 24 * 7))}w`;
}
