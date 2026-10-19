import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('public API starts without legacy DATABASE_URL and keeps the deployment boundary', async () => {
  const server = app.listen(0);
  try {
    const port = (server.address() as {port:number}).port;
    const origin = `http://127.0.0.1:${port}`;
    const health = await fetch(`${origin}/api/healthz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {status:'ok'});
    const directory = await fetch(`${origin}/api/specialists`);
    assert.equal(directory.status, 200);
    assert.equal((await directory.json()).length, 32);
    for (const path of ['/api/crm','/api/webhooks','/api/blog/generate-ai','/api/cron/generate-blog']) {
      const result = await fetch(origin+path, {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      assert.equal(result.status, 404, path);
    }
    for (const path of ['/api/admin/blog','/api/admin/catalog/properties']) {
      const result = await fetch(origin+path);
      assert.ok([401,503].includes(result.status), path);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
});
