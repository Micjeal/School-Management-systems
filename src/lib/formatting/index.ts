export function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(date);
}
export function formatMoney(value: unknown, currency = "UGX") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: currency === "UGX" ? 0 : 2 }).format(Number.isFinite(amount) ? amount : 0);
}
export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
