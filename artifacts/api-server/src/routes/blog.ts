import { humanReviewReasons } from "../lib/editorial-policy.js";
import { editorialMedia } from "../lib/editorial-media.js";
import {
  cronAuthorized,
  generateBlog,
  previewBlog,
} from "../lib/blog-agent.js";
import { editorialStatus } from "../lib/editorial-status.js";
import { requestSiteRebuild } from "../lib/site-rebuild.js";
import { Router, type IRouter } from "express";
import { randomUUID, createHash } from "node:crypto";
import { supabase } from "../lib/supabase.js";
import { requireAdmin } from "../lib/admin-auth.js";

export const isPublicPost = (row: any, now = Date.now()) =>
  row.published !== false &&
  (!row.status || row.status === "published") &&
  (!row.published_at || new Date(row.published_at).getTime() <= now);
export const mapPost = (row: any) => {
  const provenance = Array.isArray(row.sources) ? row.sources : [];
  const imageMeta =
    provenance.find(
      (s: any) => s.kind === "image" && s.media?.src === row.image,
    )?.media ||
    editorialMedia.find((m) => m.src === row.image) ||
    (!row.image
      ? editorialMedia.find(
          (m) =>
            m.id ===
            (/flamboyant|jardim goi[aá]s/i.test(row.title || "")
              ? "flamboyant"
              : "vaca-brava"),
        )
      : undefined);
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    content: row.content,
    image: row.image || imageMeta?.src || "",
    imageMeta,
    editorial: (() => {
      const entry = provenance.find((s: any) => s.kind === "editorial");
      if (!entry) return undefined;
      const { specialistReview, ...rest } = entry;
      return {
        ...rest,
        ...(specialistReview
          ? {
              specialistReview: {
                name: specialistReview.name,
                qualification: specialistReview.qualification,
                reviewedAt: specialistReview.reviewedAt,
              },
            }
          : {}),
      };
    })(),
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
            !["image", "editorial"].includes(source.kind) &&
            typeof source.url === "string" &&
            /^https?:\/\//i.test(source.url) &&
            typeof source.title === "string",
        )
      : [],
  };
};
const unavailable = (res: any) =>
  res.status(503).json({
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
router.get("/admin/blog/status", async (_req, res) => {
  try {
    res.json(await editorialStatus());
  } catch {
    unavailable(res);
  }
});
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
    res.status(400).json({
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
    res.status(400).json({
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
        res.status(409).json({
          message: "Este artigo foi alterado. Recarregue antes de salvar.",
        });
        return;
      }
    }
    const now = new Date().toISOString();
    const contentHash = createHash("sha256")
      .update(title + "\n" + summary + "\n" + content)
      .digest("hex");
    const editorial = existing?.sources?.find(
      (s: any) => s.kind === "editorial",
    );
    const needsSpecialist =
      humanReviewReasons({ title, content, summary }).length > 0 ||
      ["awaiting_specialist", "specialist_reviewed"].includes(
        editorial?.validationStatus,
      );
    const retainedApproval =
      editorial?.specialistReview?.contentHash === contentHash;
    const declaredReview =
      body.specialistConfirmed === true &&
      text(body.specialistName, 150).length >= 5 &&
      text(body.specialistRegistration, 150).length >= 3;
    if (
      status === "published" &&
      needsSpecialist &&
      !retainedApproval &&
      !declaredReview
    ) {
      res.status(422).json({
        message:
          "Esta matéria exige revisão humana especializada. Informe o profissional, sua qualificação e confirme a aprovação desta versão antes de publicar.",
      });
      return;
    }
    const specialistReview =
      status === "published" && needsSpecialist && declaredReview
        ? {
            name: text(body.specialistName, 150),
            qualification: text(body.specialistRegistration, 150),
            confirmedBy: res.locals.adminEmail,
            reviewedAt: now,
            contentHash,
          }
        : retainedApproval
          ? editorial.specialistReview
          : undefined;
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
      sources: [
        ...(needsSpecialist && !editorial
          ? [
              {
                kind: "editorial",
                title: "Registro de revisão especializada",
                url: "https://www.lopessignature.com.br/journal/" + slug,
                validationStatus: specialistReview
                  ? "specialist_reviewed"
                  : "awaiting_specialist",
                specialistReview,
              },
            ]
          : []),
        ...sources.map((s: any) => ({
          title: text(s.title, 300),
          url: text(s.url, 2000),
        })),
        ...(Array.isArray(existing?.sources)
          ? existing.sources
              .filter(
                (s: any) =>
                  s.kind === "editorial" ||
                  (s.kind === "image" && s.media?.src === image),
              )
              .map((s: any) =>
                s.kind === "editorial"
                  ? {
                      ...s,
                      specialistReview,
                      validationStatus: specialistReview
                        ? "specialist_reviewed"
                        : needsSpecialist
                          ? "awaiting_specialist"
                          : s.validationStatus,
                    }
                  : s,
              )
          : []),
      ],
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
      res.status(503).json({
        message:
          "Não foi possível salvar. Verifique a migração editorial no banco; seu texto foi mantido no formulário.",
      });
      return;
    }
    if (!data) {
      res.status(409).json({
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
async function generate(_req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(await generateBlog());
  } catch (error) {
    res.status(503).json({
      message: error instanceof Error ? error.message : "Falha na geração.",
    });
  }
}
router.post("/admin/blog/generate", generate);
router.post("/admin/blog/preview", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(
      await previewBlog(
        typeof req.body?.category === "string" ? req.body.category : undefined,
      ),
    );
  } catch (error) {
    res.status(503).json({
      message:
        error instanceof Error ? error.message : "Falha na prévia editorial.",
    });
  }
});
router.post("/admin/blog/rebuild", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const rebuild = await requestSiteRebuild();
  if (rebuild === "requested") {
    await supabase!
      .from("blog_generation_runs")
      .update({ rebuild_status: "requested" })
      .eq("status", "completed")
      .eq("rebuild_status", "failed");
  }
  res.json({ rebuild });
});
router.get(
  "/cron/generate-blog",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    if (!cronAuthorized(req.headers.authorization)) {
      res.status(401).json({ message: "Acesso não autorizado." });
      return;
    }
    next();
  },
  generate,
);
export default router;
