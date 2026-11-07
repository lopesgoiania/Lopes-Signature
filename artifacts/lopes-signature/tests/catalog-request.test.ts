import test from "node:test";
import assert from "node:assert/strict";
import {catalogRequest, CatalogRequestError} from "../src/lib/catalog.ts";

test("permission failure explains the configuration instead of hiding the server error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({message: "Acesso restrito à gestão."}), {status: 403, headers:{"Content-Type":"application/json"}}));
  await assert.rejects(catalogRequest("blog"), (error: any) => error instanceof CatalogRequestError && error.status === 403 && /SIGNATURE_ADMIN_EMAILS/.test(error.message));
});
test("non-JSON gateway failures show HTTP status and do not become JSON parse errors", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("<html>Gateway timeout</html>", {status:504}));
  await assert.rejects(catalogRequest("blog"), /HTTP 504/);
});
test("successful requests return data and carry a bounded request signal", async (t) => {
  t.mock.method(globalThis, "fetch", async (_input: any, options: any) => {
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.method,"GET");
    assert.equal(options.headers.Authorization, undefined);
    return new Response(JSON.stringify([{id:"p1"}]),{status:200});
  });
  assert.deepEqual(await catalogRequest("blog"),[{id:"p1"}]);
});
