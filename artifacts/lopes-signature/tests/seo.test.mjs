import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { render, pageSeo, publicPaths } from "../.server/entry-server.js";

const fixture = {
  properties: [
    {
      id: "p1",
      slug: "imovel-teste",
      title: "Imóvel de teste",
      price: 0,
      area: 200,
      suites: 3,
      parking: 2,
      images: ["/images/epic-signature-hero.jpg"],
      floorplans: [],
      category: "Apartamentos",
      location: "Goiânia",
      city: "Goiânia",
      neighborhood: "Setor Bueno",
      published: true,
    },
  ],
  taxonomies: [],
  specialists: [],
  posts: [
    {
      id: "post-1",
      slug: "guia-de-teste",
      title: "Guia de teste",
      summary: "Resumo verificável de teste.",
      content:
        '## Localização\n\nTexto com **ênfase** e [fonte](https://example.com).\n\n<script>window.pwned=true</script><img src="x" onerror="alert(1)"><iframe src="https://example.com"></iframe>\n\n[ruim](javascript:alert(1))',
      category: "Arquitetura",
      author: "Lopes Signature",
      published: true,
      publishedAt: "2026-10-01T12:00:00Z",
    },
  ],
};
test("article is readable in HTML before JavaScript and unsafe HTML is removed", async () => {
  const result = await render("/journal/guia-de-teste", fixture);
  assert.match(result.html, /<h1[^>]*>Guia de teste<\/h1>/);
  assert.match(result.html, /<h2>Localização<\/h2>/);
  assert.match(result.html, /<strong>ênfase<\/strong>/);
  assert.doesNotMatch(
    result.html,
    /<script|<iframe|onerror=|href="javascript:/i,
  );
  assert.equal(result.seo.path, "/journal/guia-de-teste");
  assert.equal(result.schemas.at(-1)["@type"], "BlogPosting");
});
test("detail HTML includes real property data and aliases share one canonical", async () => {
  const result = await render("/imoveis/p1", fixture);
  assert.match(result.html, /Imóvel de teste/);
  assert.match(result.html, /200 m²/);
  assert.match(result.html, /--photo-ratio:1672\/941/); // Hero geometry must exist before hydration.
  assert.equal(result.seo.path, "/imoveis/imovel-teste");
  assert.ok(publicPaths(fixture).includes("/imoveis/p1"));
});
test("each render uses an isolated query cache", async () => {
  const a = await render("/journal/guia-de-teste", fixture);
  const b = await render("/sobre", {
    properties: [],
    taxonomies: [],
    specialists: [],
    posts: [],
  });
  assert.ok(a.state.queries.length > 0);
  assert.equal(b.state.queries.length, 0);
  assert.doesNotMatch(b.html, /Guia de teste/);
});
test("empty categories are noindex, missing URLs are not treated as home", () => {
  assert.equal(pageSeo("/casas-alto-padrao-goiania", fixture).noindex, true);
  assert.equal(
    pageSeo("/apartamentos-luxo-goiania", fixture).noindex,
    undefined,
  );
  assert.equal(pageSeo("/nao-existe", fixture).status, 404);
  assert.equal(pageSeo("/admin", fixture).noindex, true);
});
test("build sitemap is XML and does not contain private URLs or fictitious freshness", async () => {
  const xml = await readFile(
    new URL("../dist/sitemap.xml", import.meta.url),
    "utf8",
  );
  assert.match(xml, /^<\?xml/);
  assert.match(xml, /<urlset/);
  assert.doesNotMatch(xml, /\/admin|\/previa\//);
  assert.doesNotMatch(xml, /<html/);
});
test("exported Journal has a unique canonical and a nonempty server root", async () => {
  const html = await readFile(
    new URL("../dist/journal.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /rel="canonical" href="https:\/\/[^"/]+\/journal"/);
  assert.match(html, /data-ssr="true"/);
  assert.match(html, /Um olhar estendido/);
  assert.match(html, /id="page-schema"/);
});
test("production routing does not rewrite unknown public URLs to home", async () => {
  const config = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.equal(config.cleanUrls, true);
  assert.ok(!config.rewrites.some((rule) => rule.source === "/(.*)"));
  const html = await readFile(
    new URL("../dist/404.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /Página não encontrada/);
  assert.match(html, /noindex,follow/);
});
