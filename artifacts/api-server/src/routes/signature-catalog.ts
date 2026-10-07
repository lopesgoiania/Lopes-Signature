import { Router } from "express";
import { randomUUID } from "node:crypto";
import { supabase } from "../lib/supabase.js";

const router = Router();
router.use((_req: any, res: any, next: any) => {
  if (!supabase)
    return res
      .status(503)
      .json({ message: "Configuração do catálogo indisponível." });
  next();
});
const publicProperty = (row: any) => {
  const p = mapProperty(row);
  delete p.signature_meta;
  delete p["100bug_id_lanc"];
  return p;
};
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const neighborhood = (row: any) => {
  if (row.signature_meta?.neighborhood) return row.signature_meta.neighborhood;
  const parts = (row.address || "").split(",").map((s: string) => s.trim());
  return (
    parts.find((s: string) => /setor|jardim|bairro|marista|bueno/i.test(s)) ||
    ""
  );
};
const planNumber = (value: any) =>
  typeof value === "number"
    ? value
    : Number(
        String(value || "")
          .replace(" m²", "")
          .replace(",", "."),
      ) || 0;
const mapProperty = (row: any) => ({
  ...row,
  ...(row.signature_meta || {}),
  id: row.id,
  title: row.title,
  location: row.signature_meta?.city || row.location,
  neighborhood: neighborhood(row),
  category: row.signature_meta?.category || "Apartamentos",
  price: Number(row.price),
  area: Number(row.area),
  suites: row.suites || 0,
  parking: row.parking || 0,
  images: row.images || [],
  gallery: row.gallery || row.images || [],
  floorplans: (row.floorplans || []).map((p: any) => ({
    ...p,
    area: planNumber(p.area),
  })),
  badges: [],
  featured: row.signature_meta?.featured ?? true,
  lpUrl: `/imoveis/${row.signature_meta?.slug || row.id}`,
  pdfUrl: row.pdf_url || "",
});
router.get("/properties", async (req: any, res: any) => {
  const { data, error } = await supabase!
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(503).json({ message: "Catálogo indisponível." });
  const q = slug(String(req.query.search || ""));
  res.json(
    (data || [])
      .map(publicProperty)
      .filter(
        (p: any) =>
          p.published !== false &&
          (!q ||
            slug(
              `${p.title} ${p.location} ${p.neighborhood} ${p.category}`,
            ).includes(q)),
      ),
  );
});
router.get("/properties/:id", async (req: any, res: any) => {
  const { data, error } = await supabase!.from("properties").select("*");
  if (error) return res.status(503).json({ message: "Catálogo indisponível." });
  const row = data?.find(
    (p: any) =>
      p.id === req.params.id || p.signature_meta?.slug === req.params.id,
  );
  if (!row || row.signature_meta?.published === false)
    return res.status(404).json({ message: "Imóvel não encontrado." });
  res.json(publicProperty(row));
});
router.get("/taxonomies", async (_req: any, res: any) => {
  const { data, error } = await supabase!
    .from("signature_taxonomies")
    .select("*")
    .order("sort_order");
  if (error)
    return res.status(503).json({ message: "Taxonomias indisponíveis." });
  res.json(data);
});
router.use("/admin/catalog", async (req: any, res: any, next: any) => {
  const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
  const { data, error } = await supabase!.auth.getUser(token);
  const allowed = (
    process.env.SIGNATURE_ADMIN_EMAILS ||
    "therrysantos4@gmail.com,lopesgynadm@gmail.com"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase());
  if (
    error ||
    !data.user ||
    !allowed.includes((data.user.email || "").toLowerCase())
  )
    return res.status(403).json({ message: "Acesso restrito à gestão." });
  next();
});
router.get("/admin/catalog/properties", async (_req: any, res: any) => {
  const { data, error } = await supabase!
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(503).json({ message: error.message });
  res.json(data?.map(mapProperty));
});
router.post("/admin/catalog/properties", async (req: any, res: any) => {
  const p = req.body;
  if (!p.title?.trim() || !p.city?.trim() || !p.category?.trim())
    return res
      .status(400)
      .json({ message: "Nome, cidade e tipo são obrigatórios." });
  if (
    p.condition &&
    !["Pronto", "Na planta", "Lançamento"].includes(p.condition)
  )
    return res.status(400).json({ message: "Condição inválida." });
  if (p.delivery && !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.delivery))
    return res.status(400).json({ message: "Entrega inválida." });
  for (const key of [
    "price",
    "area",
    "suites",
    "bedrooms",
    "bathrooms",
    "parking",
  ])
    if (!Number.isFinite(Number(p[key] || 0)) || Number(p[key] || 0) < 0)
      return res
        .status(400)
        .json({ message: "Valores numéricos devem ser positivos." });
  if (
    p.youtube &&
    !/^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(p.youtube)
  )
    return res
      .status(400)
      .json({ message: "Informe uma URL válida do YouTube." });
  const id = p.id || slug(p.title);
  if (!id || !slug(p.slug || p.title))
    return res
      .status(400)
      .json({
        message: "Nome e endereço da página precisam conter letras ou números.",
      });
  const meta = {
    slug: slug(p.slug || p.title),
    category: p.category,
    city: p.city,
    neighborhood: p.neighborhood || "",
    condition: p.condition || "",
    delivery: p.condition === "Pronto" ? "" : p.delivery || "",
    youtube: p.youtube || "",
    features: Array.isArray(p.features) ? p.features : [],
    "100bug_id_lanc": String(p["100bug_id_lanc"] || ""),
    published: p.published !== false,
    featured: !!p.featured,
    seoTitle: p.seoTitle || "",
    seoDescription: p.seoDescription || "",
    indexable: p.indexable !== false,
  };
  const { data: existing } = await supabase!
    .from("properties")
    .select("id,signature_meta");
  if (
    existing?.some(
      (r: any) => r.id !== id && r.signature_meta?.slug === meta.slug,
    )
  )
    return res
      .status(409)
      .json({ message: "Este endereço já pertence a outro imóvel." });
  const row = {
    id,
    title: p.title.trim(),
    builder: p.builder || "",
    location: p.city,
    address: p.address || p.neighborhood || "",
    price: Number(p.price) || 0,
    area: Number(p.area) || 0,
    bedrooms: Number(p.bedrooms) || 0,
    suites: Number(p.suites) || 0,
    bathrooms: Number(p.bathrooms) || 0,
    parking: Number(p.parking) || 0,
    description: p.description || "",
    images: p.images || [],
    gallery: p.gallery || [],
    floorplans: p.floorplans || [],
    signature_meta: meta,
  };
  const { data, error } = await supabase!
    .from("properties")
    .upsert(row)
    .select()
    .single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(mapProperty(data));
});
router.post("/admin/catalog/taxonomies", async (req: any, res: any) => {
  const t = req.body;
  if (
    !["type", "status", "city", "neighborhood", "feature"].includes(t.kind) ||
    !t.label?.trim()
  )
    return res.status(400).json({ message: "Taxonomia inválida." });
  if (
    t.kind === "status" &&
    !["Pronto", "Na planta", "Lançamento"].includes(t.label)
  )
    return res
      .status(400)
      .json({ message: "Use Pronto, Na planta ou Lançamento." });
  if (t.id) {
    const { data: old } = await supabase!
      .from("signature_taxonomies")
      .select("*")
      .eq("id", t.id)
      .single();
    if (old && old.kind !== t.kind)
      return res
        .status(400)
        .json({ message: "O grupo da taxonomia não pode ser alterado." });
    if (old && old.label !== t.label) {
      const { data: props } = await supabase!
        .from("properties")
        .select("signature_meta,location");
      const key = (
        {
          type: "category",
          status: "condition",
          city: "city",
          neighborhood: "neighborhood",
        } as any
      )[t.kind];
      if (
        props?.some((r: any) =>
          t.kind === "feature"
            ? (r.signature_meta?.features || []).includes(old.label)
            : (r.signature_meta?.[key] ||
                (t.kind === "city" ? r.location : "")) === old.label,
        )
      )
        return res
          .status(409)
          .json({
            message:
              "Este nome está em uso. Crie outro termo e atualize os imóveis antes de renomeá-lo.",
          });
    }
  }
  const row = {
    id: t.id || `${t.kind}-${randomUUID()}`,
    kind: t.kind,
    label: t.label.trim(),
    slug: slug(t.slug || t.label),
    parent_id: t.kind === "neighborhood" ? t.parent_id || null : null,
    show_home: !!t.show_home,
    active: t.active !== false,
    sort_order: Number(t.sort_order) || 0,
  };
  const { data, error } = await supabase!
    .from("signature_taxonomies")
    .upsert(row)
    .select()
    .single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});
router.post("/admin/catalog/media", async (req: any, res: any) => {
  const { name, type, content } = req.body;
  if (
    typeof name !== "string" ||
    !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
      type,
    ) ||
    typeof content !== "string"
  )
    return res.status(400).json({ message: "Formato não permitido." });
  const file = Buffer.from(content, "base64");
  if (file.length > 3 * 1024 * 1024)
    return res.status(400).json({ message: "Arquivo deve ter até 3 MB." });
  await supabase!.storage.createBucket("signature-media", {
    public: true,
    fileSizeLimit: 3 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
  });
  const path = `catalog/${randomUUID()}-${slug(name.split(".").slice(0, -1).join("."))}.${type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : type === "image/webp" ? "webp" : "pdf"}`;
  const { error } = await supabase!.storage
    .from("signature-media")
    .upload(path, file, { contentType: type, upsert: false });
  if (error) return res.status(400).json({ message: error.message });
  res.json({
    url: supabase!.storage.from("signature-media").getPublicUrl(path).data
      .publicUrl,
  });
});
router.post("/leads", async (req: any, res: any) => {
  const b = req.body;
  if (!b.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || ""))
    return res.status(400).json({ message: "Informe nome e e-mail válidos." });
  let property: any = null;
  if (b.propertyId) {
    const { data } = await supabase!
      .from("properties")
      .select("*")
      .eq("id", b.propertyId)
      .single();
    property = data;
    if (!property || property.signature_meta?.published === false)
      return res.status(400).json({ message: "Imóvel não encontrado." });
  }
  const crmId = property?.signature_meta?.["100bug_id_lanc"] || "";
  const lead = {
    id: randomUUID(),
    name: b.name.trim(),
    email: b.email.trim(),
    phone: b.phone || "",
    property_id: property?.id || "",
    property_title: property?.title || "",
    status: "new",
    source: property ? "property" : "newsletter",
    note: [b.note || "", crmId ? `100bug_id_lanc=${crmId}` : ""]
      .filter(Boolean)
      .join("\n"),
  };
  const { error } = await supabase!.from("leads").insert(lead);
  if (error)
    return res
      .status(503)
      .json({ message: "Não foi possível registrar o contato." });
  if (process.env.CRM_100BUG_WEBHOOK_URL && crmId) {
    try {
      const forwarded = await fetch(process.env.CRM_100BUG_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, "100bug_id_lanc": crmId }),
      });
      if (!forwarded.ok) throw new Error("CRM indisponível");
    } catch {
      console.error("Falha no encaminhamento CRM; contato preservado.");
    }
  }
  res.status(201).json({ id: lead.id, status: "new" });
});
export default router;
