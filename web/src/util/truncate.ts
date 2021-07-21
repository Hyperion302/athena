// truncate("Hello World", 5) => "He..."
export default function truncate(str: string, length: number): string {
  if (str.length < length) { return str; }
  if (length <= 3) { return "..."; }
  const innerLength = length - 3;
  if (str.length <= innerLength) { return str + "..."; }
  return str.slice(0, innerLength) + "...";
}
