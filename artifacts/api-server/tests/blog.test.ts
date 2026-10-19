import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { once } from "node:events";
import blog, { isPublicPost, mapPost, postSlug } from "../src/routes/blog.js";

test("only published, due articles are public; drafts and archives stay private", () => {
  const now = Date.parse("2026-10-15T12:00:00Z");
  assert.equal(isPublicPost({ status: "draft" }, now), false);
  assert.equal(isPublicPost({ status: "archived" }, now), false);
  assert.equal(isPublicPost({ published: false }, now), false);
  assert.equal(
    isPublicPost(
      { status: "published", published_at: "2026-10-16T12:00:00Z" },
      now,
    ),
    false,
  );
  assert.equal(
    isPublicPost(
      { status: "published", published_at: "2026-10-14T12:00:00Z" },
      now,
    ),
    true,
  );
  assert.equal(isPublicPost({ title: "Artigo legado sem estado" }, now), true);
});
test("legacy mapping does not manufacture a stock image or omit the article body", () => {
  const post = mapPost({
    id: "p1",
    title: "Título",
    content: "Conteúdo",
    created_at: "2026-10-01T12:00:00Z",
  });
  assert.equal(post.slug, "p1");
  assert.equal(post.image, "");
  assert.equal(post.content, "Conteúdo");
  assert.equal(post.author, "Lopes Signature");
  assert.equal(postSlug("Arquitetura em Goiânia!"), "arquitetura-em-goiania");
});
test("backend does not pretend an unconfigured database is an empty Journal or a successful save", async () => {
  // This test runs without production credentials; no external write is performed.
  assert.ok(!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL);
  const app = express();
  app.use(express.json());
  app.use("/api", blog);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address() as { port: number };
    const base = `http://127.0.0.1:${address.port}`;
    assert.equal((await fetch(`${base}/api/blog`)).status, 503);
    assert.equal(
      (
        await fetch(`${base}/api/admin/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        })
      ).status,
      503,
    );
    assert.equal(
      (await fetch(`${base}/api/blog/generate-ai`, { method: "POST" })).status,
      501,
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("editorial authorization rejects anonymous and non-admin sessions", async () => {
  const { createRequireAdmin } = await import("../src/lib/admin-auth.js");
  const allowed = (
    process.env.SIGNATURE_ADMIN_EMAILS ||
    "therrysantos4@gmail.com,lopesgynadm@gmail.com"
  )
    .split(",")[0]
    .trim();
  const client = {
    auth: {
      getUser: async (token: string) => ({
        data: {
          user: {
            email: token === "admin-token" ? allowed : "not-admin@example.com",
          },
        },
        error: null,
      }),
    },
  } as any;
  const app = express();
  app.use(createRequireAdmin(client));
  app.get("/", (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    assert.equal((await fetch(base)).status, 401);
    assert.equal(
      (await fetch(base, { headers: { Authorization: "Bearer other-token" } }))
        .status,
      403,
    );
    assert.equal(
      (await fetch(base, { headers: { Authorization: "Bearer admin-token" } }))
        .status,
      200,
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
