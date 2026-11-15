import { lookupVisitorCountry } from '../visitor-country.mjs';
// A single country-only lookup. Contact fields never enter this request.
export async function lookupCountry({request = fetch, timeoutMs = 2500, supported = []} = {}) {
  const controller = new AbortController();
  let timer;
  try {
    const country = await Promise.race([
      (async () => {
        return (await lookupVisitorCountry({ signal: controller.signal, request })).toLowerCase();
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('Country lookup timed out'));
        }, timeoutMs);
      }),
    ]);
    return /^[a-z]{2}$/.test(country) && supported.includes(country) ? country : 'br';
  } catch {
    return 'br';
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
