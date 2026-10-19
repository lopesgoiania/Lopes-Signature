import { requestSiteRebuild } from "../lib/site-rebuild.js";
import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { supabase } from "../lib/supabase.js";
import { requireAdmin } from "../lib/admin-auth.js";

export const isPublicPost = (row: any, now = Date.now()) =>
  row.published !== false &&
  (!row.status || row.status === "published") &&
  (!row.published_at || new Date(row.published_at).getTime() <= now);
export const mapPost = (row: any) => ({
  id: row.id,
  slug: row.slug || row.id,
  title: row.title,
  category: row.category,
  summary: row.summary,
  content: row.content,
  image: row.image || "",
  author: row.author || "Lopes Signature",
  date:
    row.date ||
    (row.published_at || row.created_at
      ? new Date(row.published_at || row.created_at).toLocaleDateString(
          "pt-BR",
          { timeZone: "America/Sao_Paulo" },
        )
      : ""),
  readTime:
    row.read_time ||
    `${Math.max(1, Math.ceil(String(row.content || "").split(/\s+/).length / 220))} min de leitura`,
  status: row.status || (row.published === false ? "draft" : "published"),
  published: isPublicPost(row),
  publishedAt: row.published_at || row.created_at,
  updatedAt: row.updated_at || row.created_at,
  seoTitle: row.seo_title || "",
  seoDescription: row.seo_description || "",
  sources: Array.isArray(row.sources)
    ? row.sources.filter(
        (source: any) =>
          source &&
          typeof source.url === "string" &&
          /^https?:\/\//i.test(source.url) &&
          typeof source.title === "string",
      )
    : [],
});
const unavailable = (res: any) =>
  res
    .status(503)
    .json({
      message: "O Journal está temporariamente indisponível. Tente novamente.",
    });
const router: IRouter = Router();
router.get("/blog", async (_req, res) => {
  if (!supabase) {
    unavailable(res);
    return;
  }
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      unavailable(res);
      return;
    }
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    );
    res.json((data || []).filter((row) => isPublicPost(row)).map(mapPost));
  } catch {
    unavailable(res);
  }
});
router.get("/blog/:id", async (req, res) => {
  if (!supabase) {
    unavailable(res);
    return;
  }
  try {
    // Compatible with the original schema; once migrated, slug and id both work.
    const { data, error } = await supabase.from("blog_posts").select("*");
    if (error) {
      unavailable(res);
      return;
    }
    const row = data?.find(
      (item) =>
        (item.id === req.params.id || item.slug === req.params.id) &&
        isPublicPost(item),
    );
    if (!row) {
      res.status(404).json({ message: "Artigo não encontrado." });
      return;
    }
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    );
    res.json(mapPost(row));
  } catch {
    unavailable(res);
  }
});
router.use("/admin/blog", requireAdmin);
router.get("/admin/blog", async (_req, res) => {
  try {
    const { data, error } = await supabase!
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      unavailable(res);
      return;
    }
    res.json((data || []).map(mapPost));
  } catch {
    unavailable(res);
  }
});
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export const postSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
router.post("/admin/blog", async (req, res) => {
  const body = req.body || {};
  const title = text(body.title, 200),
    content = text(body.content, 100_000),
    summary = text(body.summary, 1000);
  const slug = postSlug(text(body.slug || title, 200));
  if (typeof body.content === "string" && body.content.length > 100_000) {
    res.status(400).json({ message: "O artigo excede o tamanho permitido." });
    return;
  }
  const status = body.status;
  if (
    !title ||
    !content ||
    !summary ||
    !slug ||
    !["draft", "published", "archived"].includes(status)
  ) {
    res
      .status(400)
      .json({
        message:
          "Preencha título, resumo, conteúdo e um estado editorial válido.",
      });
    return;
  }
  const sources = Array.isArray(body.sources) ? body.sources : [];
  if (
    sources.length > 30 ||
    sources.some(
      (s: any) =>
        !s ||
        typeof s.url !== "string" ||
        !/^https?:\/\//i.test(s.url) ||
        typeof s.title !== "string",
    )
  ) {
    res
      .status(400)
      .json({
        message: "Informe fontes com título e endereço HTTP ou HTTPS válidos.",
      });
    return;
  }
  const image = text(body.image, 2000);
  if (image && !/^https?:\/\//i.test(image) && !/^\/(?!\/)/.test(image)) {
    res
      .status(400)
      .json({ message: "Use uma imagem local ou um endereço HTTPS válido." });
    return;
  }
  try {
    let existing: any;
    if (body.id) {
      const result = await supabase!
        .from("blog_posts")
        .select("*")
        .eq("id", text(body.id, 200))
        .maybeSingle();
      if (result.error) {
        unavailable(res);
        return;
      }
      existing = result.data;
      if (!existing) {
        res.status(404).json({ message: "Artigo não encontrado." });
        return;
      }
      if (
        body.updatedAt &&
        body.updatedAt !== (existing.updated_at || existing.created_at)
      ) {
        res
          .status(409)
          .json({
            message: "Este artigo foi alterado. Recarregue antes de salvar.",
          });
        return;
      }
    }
    const now = new Date().toISOString();
    const row = {
      id: existing?.id || `post-${randomUUID()}`,
      slug,
      title,
      summary,
      content,
      image,
      category: text(body.category, 100) || "Journal",
      author: text(body.author, 150) || "Lopes Signature",
      status,
      published: status === "published",
      published_at:
        status === "published"
          ? existing?.published_at || now
          : existing?.published_at || null,
      updated_at: now,
      seo_title: text(body.seoTitle, 200),
      seo_description: text(body.seoDescription, 500),
      sources: sources.map((s: any) => ({
        title: text(s.title, 300),
        url: text(s.url, 2000),
      })),
      read_time: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 220))} min de leitura`,
    };
    let query = existing
      ? supabase!.from("blog_posts").update(row).eq("id", existing.id)
      : supabase!.from("blog_posts").insert(row);
    if (existing?.updated_at)
      query = query.eq("updated_at", existing.updated_at);
    const { data, error } = await query.select("*").maybeSingle();
    if (error) {
      if (error.code === "23505") {
        res
          .status(409)
          .json({ message: "Já existe um artigo com esse endereço." });
        return;
      }
      res
        .status(503)
        .json({
          message:
            "Não foi possível salvar. Verifique a migração editorial no banco; seu texto foi mantido no formulário.",
        });
      return;
    }
    if (!data) {
      res
        .status(409)
        .json({
          message: "Este artigo foi alterado. Recarregue antes de salvar.",
        });
      return;
    }
    const rebuild =
      status === "published" ||
      existing?.status === "published" ||
      (existing && !existing.status)
        ? await requestSiteRebuild()
        : "not_needed";
    res.status(existing ? 200 : 201).json({ post: mapPost(data), rebuild });
  } catch {
    unavailable(res);
  }
});
// The legacy generation endpoints are deliberately disabled while the editorial automation is being chosen.
router.all(["/blog/generate-ai", "/cron/generate-blog"], (_req, res) => {
  res
    .status(501)
    .json({ message: "A automação editorial ainda não foi configurada." });
});
export default router;
