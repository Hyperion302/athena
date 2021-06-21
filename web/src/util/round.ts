export default function round(x: number, y: number): number {
  const exp = Math.pow(10, y);
  return Math.round(x * exp) / exp;
}
