import test from "node:test";
import assert from "node:assert/strict";
import { detectVisitorCountry, internationalPhone } from "../src/lib/phone.js";
import app from "../src/app.js";

test("validates international numbers without guessing a missing country", () => {
  for (const number of [
    "+5562999999999",
    "+12133734253",
    "+442079460018",
    "+351912345678",
  ]) {
    assert.equal(internationalPhone(number), number);
  }
  for (const invalid of [
    "62999999999",
    "+5500000000000",
    "+1213",
    "+1abc2133734253",
    {},
    null,
    "+5562999999999 ext 1",
  ]) {
    assert.equal(internationalPhone(invalid), null);
  }
});
test("IPAPI takes priority and failures keep the Vercel or Brazilian default", async () => {
  const lookup: typeof fetch = async (url, options) => {
    assert.equal(url, "https://ipapi.co/8.8.8.8/country/");
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal);
    return new Response("US\n");
  };
  assert.deepEqual(await detectVisitorCountry("8.8.8.8", "PT", lookup), {
    country: "US", source: "ipapi", lookup: "ok",
  });
  const failures: [() => Response, string][] = [
    [() => new Response("", { status: 429 }), "http-429"],
    [() => new Response("XX"), "invalid-country"],
    [() => { throw new Error("timeout"); }, "unavailable"],
  ];
  for (const [response, lookup] of failures) {
    assert.deepEqual(await detectVisitorCountry("8.8.8.8", "PT", async () => response()), {
      country: "PT", source: "vercel", lookup,
    });
  }
  for (const value of [undefined, "XX", "T1", ["US"], ""]) {
    assert.deepEqual(await detectVisitorCountry(undefined, value), {
      country: "BR", source: "default", lookup: "no-ip",
    });
  }
});
test("visitor country is database independent and never shared in a cache", async () => {
  const server = app.listen(0);
  try {
    const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    for (const [header, expected] of [
      ["US", "US"],
      ["PT", "PT"],
      ["XX", "BR"],
      ["", "BR"],
    ]) {
      const response = await fetch(`${origin}/api/visitor-country`, {
        headers: { "x-vercel-ip-country": header },
      });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { country: expected });
      assert.equal(response.headers.get("x-signature-country-source"), expected === "BR" ? "default" : "vercel");
      assert.match(response.headers.get("cache-control")!, /private, no-store/);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
