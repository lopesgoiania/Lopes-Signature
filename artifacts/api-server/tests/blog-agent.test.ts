import test from "node:test";
import assert from "node:assert/strict";
import {
  cronAuthorized,
  localDay,
  responseText,
  researchSources,
  validateArticle,
  generateBlog,
  isPrimarySource,
  approvedReview,
} from "../src/lib/blog-agent.js";
const sources = [
  { title: "Fonte primária", url: "https://ademigo.com.br/dados" },
  { title: "Notícia", url: "https://news.example.com/goiania" },
];
const article = () => ({
  approved: true,
  reason: "",
  title: "Arquitetura e conforto residencial em Goiânia",
  summary:
    "Uma análise dos critérios de conforto para decisões residenciais no mercado de alto padrão em Goiânia.",
  category: "Arquitetura",
  content:
    "## Conforto em Goiânia\n" +
    "Análise de arquitetura e conforto residencial com critérios de decisão. ".repeat(
      70,
    ) +
    sources.map((s) => `[${s.title}](${s.url})`).join("\n"),
  seoTitle: "Conforto e arquitetura em Goiânia",
  seoDescription:
    "Entenda critérios de conforto e arquitetura para escolher uma residência de alto padrão em Goiânia com informações de fontes locais.",
  sourceUrls: sources.map((s) => s.url),
});
const completed = (text: string, annotations: any[] = []) => ({
  status: "completed",
  output: [
    { type: "message", content: [{ type: "output_text", text, annotations }] },
  ],
});
test("cron rejects missing and incorrect secrets; local date follows Brasília", () => {
  assert.equal(cronAuthorized(undefined, "secret"), false);
  assert.equal(cronAuthorized("Bearer bad", "secret"), false);
  assert.equal(cronAuthorized("Bearer secret", "secret"), true);
  assert.equal(cronAuthorized("Bearer ", ""), false);
  assert.equal(localDay(new Date("2026-11-07T01:00:00Z")), "2026-11-06");
});
test("extracts cited sources, rejects incomplete responses, unsupported links and duplicate topics", () => {
  assert.throws(() => responseText({ status: "incomplete" }));
  assert.equal(
    researchSources(
      completed(
        "research",
        sources.map((s) => ({ ...s, type: "url_citation" })),
      ),
    ).length,
    2,
  );
  assert.equal(validateArticle(article(), sources, []).length, 2);
  assert.throws(() =>
    validateArticle(
      { ...article(), sourceUrls: [sources[0].url] },
      sources,
      [],
    ),
  );
  assert.throws(() =>
    validateArticle(
      {
        ...article(),
        content: article().content + " [inventado](https://fake.test)",
      },
      sources,
      [],
    ),
  );
  assert.throws(() =>
    validateArticle(article(), sources, [{ title: article().title }]),
  );
  assert.throws(() =>
    validateArticle(
      { ...article(), approved: false, reason: "sem evidências" },
      sources,
      [],
    ),
  );
});
function fakeClient(claim: any = "run-1") {
  const writes: any[] = [];
  return {
    writes,
    rpc: async () => ({ data: claim }),
    from: (table: string) => {
      const q: any = {
        select: () => q,
        order: () => q,
        limit: async () => ({ data: [], error: null }),
        eq: () => q,
        insert: (row: any) => {
          writes.push({ table, row });
          return q;
        },
        update: (row: any) => {
          writes.push({ table, row });
          return q;
        },
        single: async () => ({
          data: { id: "ai-2026-11-07", slug: "article" },
          error: null,
        }),
        then: (resolve: any) => resolve({ error: null }),
      };
      return q;
    },
  };
}
async function configured(fn: () => Promise<void>) {
  const keys = [
    "OPENAI_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SITE_REBUILD_HOOK_URL",
  ];
  const old = keys.map((k) => process.env[k]);
  keys.forEach((k) => (process.env[k] = "test-only"));
  try {
    await fn();
  } finally {
    keys.forEach((k, i) =>
      old[i] === undefined ? delete process.env[k] : (process.env[k] = old[i]),
    );
  }
}
test("full pipeline publishes only after research and approval; failed rebuild does not regenerate", async () =>
  configured(async () => {
    const db = fakeClient();
    let calls = 0;
    const request = async () =>
      [
        completed(
          "Dossiê factual",
          sources.map((s) => ({ ...s, type: "url_citation" })),
        ),
        completed(JSON.stringify(article())),
        completed(
          JSON.stringify({
            approved: true,
            luxuryFit: true,
            reason: "",
            primarySourceUrl: sources[0].url,
            luxuryFit: true,
          }),
        ),
      ][calls++];
    const result = await generateBlog(db as any, request, async () => "failed");
    assert.equal(result.status, "published");
    assert.equal(calls, 3);
    assert.equal(db.writes.filter((w) => w.table === "blog_posts").length, 1);
    assert.ok(db.writes.some((w) => w.row.status === "completed"));
    assert.ok(db.writes.some((w) => w.row.rebuild_status === "failed"));
    const skipped = await generateBlog(fakeClient(null) as any, async () => {
      throw Error("must not call");
    });
    assert.equal(skipped.status, "skipped");
  }));
test("review rejection prevents any article write and records a failed run", async () =>
  configured(async () => {
    const db = fakeClient();
    let calls = 0;
    const request = async () =>
      [
        completed(
          "Dossiê",
          sources.map((s) => ({ ...s, type: "url_citation" })),
        ),
        completed(JSON.stringify(article())),
        completed(
          JSON.stringify({
            approved: false,
            reason: "Fato sem sustentação",
            primarySourceUrl: "",
          }),
        ),
      ][calls++];
    await assert.rejects(generateBlog(db as any, request), /Revisão editorial/);
    assert.equal(db.writes.filter((w) => w.table === "blog_posts").length, 0);
    assert.ok(db.writes.some((w) => w.row.status === "failed"));
  }));

test("review cannot treat a news portal as primary evidence or approve an out-of-segment topic", () => {
  assert.equal(
    isPrimarySource("https://www.autimob.com.br/noticias/test"),
    false,
  );
  assert.equal(
    isPrimarySource("https://avolli.com.br.fake.test/article"),
    false,
  );
  assert.equal(isPrimarySource("https://ademigo.com.br/blog/test"), true);
  assert.equal(
    approvedReview(
      { approved: true, luxuryFit: false, primarySourceUrl: sources[0].url },
      sources,
    ),
    false,
  );
  assert.equal(
    approvedReview(
      { approved: true, luxuryFit: true, primarySourceUrl: sources[1].url },
      sources,
    ),
    false,
  );
});
