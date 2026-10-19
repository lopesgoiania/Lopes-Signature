export { default as specialistDirectory } from "../../api-server/src/data/specialists.json";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { dehydrate } from "@tanstack/react-query";
import App, { createAppQueryClient } from "./App";
import { ErrorBoundary } from "./components/error-boundary";
import {
  pageSeo,
  seoSchemas,
  staticPages,
  type PublicSnapshot,
} from "./lib/seo";
import { propertyHref, taxonomyHref } from "./lib/catalog-model";
import { postHref } from "./lib/journal";

export { pageSeo, seoSchemas };
export function publicPaths(data: PublicSnapshot) {
  return [
    ...new Set([
      ...Object.keys(staticPages),
      ...data.properties.flatMap((p) => [
        propertyHref(p),
        propertyHref({ id: p.id }),
      ]),
      ...data.taxonomies.filter((t) => t.active).map(taxonomyHref),
      ...data.posts.flatMap((p) => [
        postHref(p),
        postHref({ ...p, slug: undefined }),
      ]),
    ]),
  ];
}

export async function render(path: string, data: PublicSnapshot) {
  const client = createAppQueryClient();
  const set = (key: unknown[], value: unknown) =>
    client.setQueryData(key, value);
  // Include only data needed by the route, never private data or credentials.
  if (
    path === "/" ||
    path === "/imoveis" ||
    path.includes("goiania") ||
    path.startsWith("/imoveis/taxonomia/")
  )
    set(["/api/properties"], data.properties);
  if (path === "/" || path.startsWith("/imoveis") || path.includes("goiania"))
    set(["taxonomies"], data.taxonomies);
  if (path === "/especialistas") set(["/api/specialists"], data.specialists);
  if (path === "/" || path === "/journal") set(["journal-posts"], data.posts);
  if (/^\/imoveis\/[^/]+$/.test(path)) {
    const id = decodeURIComponent(path.split("/").pop()!);
    const property = data.properties.find(
      (p) => (p.slug || p.id) === id || p.id === id,
    );
    if (property) set(["catalog-property", id], property);
  }
  if (path.startsWith("/journal/")) {
    const id = decodeURIComponent(path.split("/").pop()!);
    const post = data.posts.find((p) => (p.slug || p.id) === id || p.id === id);
    if (post) set(["journal-post", id], post);
  }
  const seo = pageSeo(path, data);
  const html = await new Promise<string>((resolve, reject) => {
    const body = new PassThrough();
    let content = "";
    let error: unknown;
    const timer = setTimeout(() => {
      stream.abort();
      reject(new Error(`Tempo excedido ao renderizar ${path}`));
    }, 20_000);
    body.setEncoding("utf8");
    body.on("data", (chunk) => {
      content += chunk;
    });
    body.on("error", reject);
    body.on("end", () => {
      clearTimeout(timer);
      error ? reject(error) : resolve(content);
    });
    const stream = renderToPipeableStream(
      <ErrorBoundary>
        <App queryClient={client} ssrPath={path} />
      </ErrorBoundary>,
      {
        onAllReady() {
          stream.pipe(body);
        },
        onShellError(err) {
          clearTimeout(timer);
          reject(err);
        },
        onError(err) {
          error = err;
        },
      },
    );
  });
  const state = dehydrate(client);
  client.clear();
  return { html, state, seo, schemas: seoSchemas(seo) };
}
