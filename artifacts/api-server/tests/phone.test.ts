import test from "node:test";
import assert from "node:assert/strict";
import { internationalPhone, visitorCountry } from "../src/lib/phone.js";
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
test("country lookup falls back to Brazil for absent or unsupported locations", () => {
  for (const value of [undefined, "XX", "T1", ["US"], ""])
    assert.equal(visitorCountry(value), "BR");
  assert.equal(visitorCountry("us"), "US");
  assert.equal(visitorCountry("PT"), "PT");
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
      assert.match(response.headers.get("cache-control")!, /private, no-store/);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
