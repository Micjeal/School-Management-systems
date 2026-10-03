const COUNTRY_CODE = /^[A-Z]{2}$/;

export function normalizeCountryCode(value: unknown, fallback = "UG") {
  const code =
    String(value ?? "")
      .trim()
      .toUpperCase() || fallback;
  if (!COUNTRY_CODE.test(code)) throw new Error("Country must use a 2-letter country code.");
  return code;
}
