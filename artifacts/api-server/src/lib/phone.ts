import {
  getCountries,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

export function visitorCountry(header: unknown): string {
  const country = typeof header === "string" ? header.toUpperCase() : "";
  return getCountries().some((code) => code === country) ? country : "BR";
}

export function internationalPhone(value: unknown): string | null {
  if (typeof value !== "string" || !/^\+[1-9]\d{1,14}$/.test(value))
    return null;
  const phone = parsePhoneNumberFromString(value);
  return phone?.isValid() ? phone.number : null;
}
