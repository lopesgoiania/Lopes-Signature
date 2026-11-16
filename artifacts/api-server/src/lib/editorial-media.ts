import library from "../../../lopes-signature/src/lib/journal-media.json" with { type: "json" };
import { supabase } from "./supabase.js";
export type EditorialMedia = (typeof library)[number];
export const editorialMedia = library;
export const premiumMedia = (media: EditorialMedia) =>
  media.src !== "/images/journal/goiania.jpg" &&
  !/martelo|miniatura|satélite|satellite|gavel|house keys|contrato|dinheiro|mapa técnico/i.test(
    `${media.alt} ${media.caption} ${media.topic}`,
  );
const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .trim()
    .slice(0, 300);
export function permittedMediaHost(url: string) {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
export function commonsMedia(data: any): EditorialMedia[] {
  return Object.values(data?.query?.pages || {}).flatMap((page: any) => {
    const i = page.imageinfo?.[0],
      m = i?.extmetadata || {};
    const value = (key: string) => String(m[key]?.value || "");
    const license = value("LicenseShortName"),
      src = i?.url;
    if (
      !i ||
      i.width < 1200 ||
      i.height > i.width ||
      i.size > 8 * 1024 * 1024 ||
      !/^(CC BY(?:-SA)? [1-4]\.0|CC0|Public domain)$/.test(license) ||
      !permittedMediaHost(src)
    )
      return [];
    return [
      {
        id: `commons-${page.pageid}`,
        src,
        alt: plain(page.title.replace(/^File:/, "")),
        caption: plain(
          page.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
        ),
        credit: plain(value("Artist")) || "Wikimedia Commons",
        license,
        licenseUrl: value("LicenseUrl"),
        sourceUrl: i.descriptionurl,
        originalUrl: i.url,
        topic:
          plain(value("ImageDescription")) ||
          "Imagem de contexto; respeitar lugar e data da fotografia",
      },
    ];
  });
}
export async function discoverEditorialMedia(
  query: string,
): Promise<EditorialMedia[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${query.slice(0, 160)} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600",
    format: "json",
  });
  try {
    const result = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      {
        headers: {
          "User-Agent":
            "LopesSignatureEditorial/1.0 (https://lopessignature.com.br)",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    return [
      ...(result.ok ? commonsMedia(await result.json()).slice(0, 8) : []),
      ...editorialMedia,
    ].filter(premiumMedia);
  } catch {
    return editorialMedia.filter(premiumMedia);
  }
}
export async function storeEditorialMedia(
  media: EditorialMedia,
  day: string,
  client = supabase,
): Promise<EditorialMedia> {
  if (media.src.startsWith("/images/journal/")) return media;
  if (!client || !permittedMediaHost(media.src))
    throw new Error("Imagem sem origem autorizada.");
  const response = await fetch(media.src, {
    signal: AbortSignal.timeout(12_000),
    redirect: "error",
  });
  const mime = (response.headers.get("Content-Type") || "").split(";")[0];
  if (!response.ok || !["image/jpeg", "image/png", "image/webp"].includes(mime))
    throw new Error("A imagem selecionada não pôde ser obtida.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 8 * 1024 * 1024)
    throw new Error("A imagem excede o tamanho editorial permitido.");
  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `journal/${day}-${media.id}.${ext}`;
  const uploaded = await client.storage
    .from("signature-media")
    .upload(path, bytes, {
      contentType: mime,
      upsert: true,
      cacheControl: "31536000",
    });
  if (uploaded.error)
    throw new Error("Não foi possível guardar a capa no acervo do site.");
  return {
    ...media,
    src: client.storage.from("signature-media").getPublicUrl(path).data
      .publicUrl,
  };
}
export const imageProvenance = (media: EditorialMedia) => ({
  kind: "image",
  title: media.caption,
  url: media.sourceUrl,
  media,
});

// Match the same photograph across local copies, Commons thumbnails and storage URLs.
export function mediaKeys(media: Partial<EditorialMedia>) {
  const keys = new Set<string>();
  if (media.id) keys.add(media.id);
  for (const raw of [media.src, media.sourceUrl, media.originalUrl]) {
    if (!raw) continue;
    try {
      const u = new URL(raw, "https://www.lopessignature.com.br");
      let name = decodeURIComponent(u.pathname.split("/").pop() || "")
        .replace(/^File:/i, "")
        .replace(/^\d+px-/, "");
      name = name.replace(/\s+/g, "_").toLowerCase();
      if (name) keys.add(name);
      const id = name.match(/commons-(\d+)/);
      if (id) keys.add(`commons-${id[1]}`);
    } catch {
      /* Invalid provenance is never a useful identity. */
    }
  }
  return keys;
}
export function freshCoverCandidates(
  candidates: EditorialMedia[],
  posts: any[],
  window = 12,
) {
  const recent = posts
    .filter(
      (p) => p.published !== false && (!p.status || p.status === "published"),
    )
    .sort(
      (a, b) =>
        Date.parse(b.published_at || b.created_at || b.publishedAt || "") -
        Date.parse(a.published_at || a.created_at || a.publishedAt || ""),
    )
    .slice(0, window);
  const blocked = new Set<string>();
  for (const post of recent) {
    const media = post.imageMeta ||
      post.sources?.find(
        (s: any) => s.kind === "image" && s.media?.src === post.image,
      )?.media ||
      editorialMedia.find((m) => m.src === post.image) || { src: post.image };
    for (const key of mediaKeys(media)) blocked.add(key);
  }
  const seen = new Set<string>();
  return candidates.filter((media) => {
    const keys = [...mediaKeys(media)];
    if (keys.some((key) => blocked.has(key) || seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}
export function coverVisualInput(text: string, candidates: EditorialMedia[]) {
  return [
    {
      role: "user",
      content: [
        { type: "input_text", text },
        ...candidates.flatMap((media) => [
          {
            type: "input_text",
            text: `Fotografia ${media.id}: ${media.caption}. Contexto factual: ${media.topic}. Avalie também enquadramento, resolução e pertinência visual.`,
          },
          {
            type: "input_image",
            image_url: media.src.startsWith("/")
              ? `https://www.lopessignature.com.br${media.src}`
              : media.src,
            detail: "low",
          },
        ]),
      ],
    },
  ];
}
