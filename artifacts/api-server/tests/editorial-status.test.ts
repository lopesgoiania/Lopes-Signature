import test from "node:test";
import assert from "node:assert/strict";
import { editorialStatus } from "../src/lib/editorial-status.js";
const client = (error: any) =>
  ({
    from: () => ({
      select: () => ({
        limit: async () => ({ error }),
        order: () => ({ limit: async () => ({ error: null, data: [] }) }),
      }),
    }),
  }) as any;
test("editor readiness distinguishes missing migration, unavailable DB and ready schema", async () => {
  for (const [error, rebuild, expected] of [
    [{ code: "42703" }, false, [false, true]],
    [{ code: "NETWORK" }, true, [false, false]],
    [null, true, [true, true]],
  ] as const) {
    const result = await editorialStatus(client(error), rebuild);
    assert.deepEqual([result.schemaReady, result.databaseAvailable], expected);
    assert.equal(result.rebuildConfigured, rebuild);
    assert.equal(result.automationSchemaReady, true);
  }
});
