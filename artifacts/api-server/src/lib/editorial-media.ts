import library from "../../../lopes-signature/src/lib/journal-media.json" with { type: "json" };
import { supabase } from "./supabase.js";
export type EditorialMedia = (typeof library)[number];
export const editorialMedia = library;
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
      src = i?.thumburl || i?.url;
    if (
      !i ||
      i.width < 1200 ||
      i.height > i.width ||
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
        topic: "Imagem de contexto; respeitar lugar e data da fotografia",
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
    gsrsearch: `${query.slice(0, 100)} Goiânia filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "5",
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
      ...(result.ok ? commonsMedia(await result.json()).slice(0, 3) : []),
      ...editorialMedia,
    ];
  } catch {
    return editorialMedia;
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
  if (bytes.length > 3 * 1024 * 1024)
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
