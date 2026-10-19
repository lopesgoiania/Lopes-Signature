import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, publicPaths, specialistDirectory } from "../.server/entry-server.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const origin = new URL(
  process.env.VITE_SITE_URL || "https://lopessignature.vercel.app",
).origin;
const contentOrigin = new URL(process.env.CONTENT_API_URL || origin);
if (
  !["https:", "http:"].includes(contentOrigin.protocol) ||
  (contentOrigin.protocol === "http:" &&
    !["localhost", "127.0.0.1"].includes(contentOrigin.hostname))
)
  throw new Error(
    "CONTENT_API_URL precisa de HTTPS (ou localhost para testes).",
  );
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const json = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
const template = await readFile(path.join(dist, "index.html"), "utf8");

async function read(endpoint) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const contentUrl = new URL(`/api/${endpoint}`, contentOrigin);
      contentUrl.searchParams.set("__build", String(Date.now()));
      const response = await fetch(contentUrl, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const value = await response.json();
      if (!Array.isArray(value)) throw new Error("Resposta não é uma lista.");
      return value;
    } catch (error) {
      if (attempt === 1)
        throw new Error(
          `Publicação interrompida: ${endpoint} indisponível. A versão anterior deve ser preservada.`,
          { cause: error },
        );
    }
  }
}
const [properties, taxonomies, posts] = await Promise.all(
  ["properties", "taxonomies", "blog"].map(read),
);
const data = {
  properties: properties.filter((p) => p.published !== false),
  taxonomies,
  specialists: specialistDirectory,
  posts: posts.filter((p) => p.published !== false),
};
const paths = publicPaths(data);
const sitemap = [];
function document(result) {
  const { seo, schemas, state, html } = result;
  const url = new URL(seo.path, origin).href;
  const image = new URL(
    seo.image || "/images/signature-hero-poster.jpg",
    origin,
  ).href;
  const head = `<title>${escape(seo.title)}</title>\n<meta name="description" content="${escape(seo.description)}">\n<meta name="robots" content="${seo.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}">\n<link rel="canonical" href="${escape(url)}">\n<meta property="og:site_name" content="Lopes Signature">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:type" content="${seo.article ? "article" : "website"}">\n<meta property="og:title" content="${escape(seo.title)}">\n<meta property="og:description" content="${escape(seo.description)}">\n<meta property="og:url" content="${escape(url)}">\n<meta property="og:image" content="${escape(image)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${escape(seo.title)}">\n<meta name="twitter:description" content="${escape(seo.description)}">\n<meta name="twitter:image" content="${escape(image)}">\n<script type="application/ld+json" id="page-schema">${json(schemas)}</script>`;
  return template
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(
      /<meta\s[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,
      "",
    )
    .replace(/<link\s[^>]*rel="canonical"[^>]*>/g, "")
    .replace("</head>", `${head}\n</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-ssr="true">${html}</div><script type="application/json" id="query-state">${json(state)}</script>`,
    );
}
for (const route of [...paths, "/404"]) {
  const file = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  const target = path.resolve(dist, file);
  if (
    !target.startsWith(`${dist}${path.sep}`) ||
    route.split("/").some((segment) => [".", ".."].includes(segment))
  )
    throw new Error("URL inválida no conteúdo publicado.");
  const result = await render(route, data);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, document(result));
  if (route !== "/404" && !result.seo.noindex && result.seo.path === route) {
    const post = result.seo.article;
    // Never invent freshness by using the build time as lastmod.
    const modified = post?.updatedAt || post?.publishedAt;
    const lastmod =
      modified && !Number.isNaN(Date.parse(modified))
        ? `<lastmod>${new Date(modified).toISOString()}</lastmod>`
        : "";
    sitemap.push(
      `<url><loc>${escape(new URL(route, origin).href)}</loc>${lastmod}</url>`,
    );
  }
}
// Only authenticated/admin previews retain client-only routing. Unknown public URLs use 404.html.
await writeFile(
  path.join(dist, "app.html"),
  template
    .replace(
      /<meta name="robots"[^>]*>/,
      '<meta name="robots" content="noindex,nofollow">',
    )
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, ""),
);
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.join("\n")}</urlset>\n`,
);
await writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  path.join(dist, "build-content.json"),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    pages: paths.length,
    articles: data.posts.length,
    properties: data.properties.length,
  }),
);
console.log(
  `HTML gerado para ${paths.length} páginas públicas; ${sitemap.length} URLs no sitemap. Nenhum conteúdo criado ou alterado no banco.`,
);
