import { isIP } from "node:net";
import {
  getCountries,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

function supportedCountry(value: unknown): string | undefined {
  const country = typeof value === "string" ? value.trim().toUpperCase() : "";
  return getCountries().find((code) => code === country);
}

export async function detectVisitorCountry(
  clientIp: unknown,
  countryHint: unknown,
  request = fetch,
): Promise<{ country: string; source: "ipapi" | "vercel" | "default" }> {
  const vercelCountry = supportedCountry(countryHint);
  const fallback = vercelCountry
    ? { country: vercelCountry, source: "vercel" as const }
    : { country: "BR", source: "default" as const };
  const ip = typeof clientIp === "string" ? clientIp.split(",")[0]?.trim() : "";
  if (!ip || !isIP(ip)) return fallback;

  try {
    const response = await request(`https://ipapi.co/${ip}/country/`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(1500),
      redirect: "error",
    });
    const country = response.ok && supportedCountry(await response.text());
    return country ? { country, source: "ipapi" } : fallback;
  } catch {
    return fallback;
  }
}

export function internationalPhone(value: unknown): string | null {
  if (typeof value !== "string" || !/^\+[1-9]\d{1,14}$/.test(value))
    return null;
  const phone = parsePhoneNumberFromString(value);
  return phone?.isValid() ? phone.number : null;
}
