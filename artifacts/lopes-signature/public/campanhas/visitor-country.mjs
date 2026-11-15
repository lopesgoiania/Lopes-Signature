export async function lookupVisitorCountry({ signal, request = fetch } = {}) {
  const options = { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" };
  try {
    const deadline = AbortSignal.timeout(1200);
    const response = await request("https://ipapi.co/country/", {
      ...options,
      signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
    });
    if (response.ok) {
      const country = (await response.text()).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(country)) return country;
    }
  } catch {
    // A blocked or unavailable IPAPI must leave automatic detection available.
  }

  const response = await request("/api/visitor-country", { ...options, signal });
  if (!response.ok) throw new Error("Country lookup unavailable");
  const { country } = await response.json();
  return typeof country === "string" ? country.trim().toUpperCase() : "";
}
