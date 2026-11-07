// A single country-only lookup. Contact fields never enter this request.
export async function lookupCountry({request = fetch, timeoutMs = 2500, supported = []} = {}) {
  const controller = new AbortController();
  let timer;
  try {
    const country = await Promise.race([
      (async () => {
        const response = await request('/api/visitor-country', {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Country lookup failed');
        const result = await response.json();
        return typeof result.country === 'string' ? result.country.toLowerCase() : '';
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
