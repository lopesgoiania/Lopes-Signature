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

const mapsValue = (value: any) => ({
  enabled: value?.enabled === true,
  apiKey: String(value?.apiKey || ""),
  mapId: String(value?.mapId || ""),
});
router.get("/maps-config", async (_req: any, res: any) => {
  const { data, error } = await supabase!
    .from("signature_settings")
    .select("value")
    .eq("id", "google_maps")
    .single();
  if (error)
    return res
      .status(503)
      .json({ message: "Integração de mapas indisponível." });
  const config = mapsValue(data?.value);
  res.setHeader("Cache-Control", "no-store");
  res.json(config.enabled ? config : { ...config, apiKey: "", mapId: "" });
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

router.get("/admin/catalog/maps", async (_req: any, res: any) => {
  const { data, error } = await supabase!
    .from("signature_settings")
    .select("value")
    .eq("id", "google_maps")
    .single();
  if (error)
    return res
      .status(503)
      .json({ message: "Não foi possível carregar o Google Maps." });
  res.setHeader("Cache-Control", "no-store");
  res.json(mapsValue(data?.value));
});
router.post("/admin/catalog/maps", async (req: any, res: any) => {
  const config = mapsValue(req.body);
  config.apiKey = config.apiKey.trim();
  config.mapId = config.mapId.trim();
  if (
    ((config.enabled || config.apiKey) &&
      !/^AIza[0-9A-Za-z_-]{35}$/.test(config.apiKey)) ||
    config.mapId.length > 100 ||
    config.apiKey.length > 100
  )
    return res.status(400).json({
      message: "Informe uma chave de navegador válida do Google Maps.",
    });
  const { error } = await supabase!.from("signature_settings").upsert({
    id: "google_maps",
    value: config,
    updated_at: new Date().toISOString(),
  });
  if (error)
    return res
      .status(503)
      .json({ message: "Não foi possível salvar o Google Maps." });
  res.json(config);
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
    return res.status(400).json({
      message: "Nome e endereço da página precisam conter letras ou números.",
    });
  const { data: registered, error: taxonomyError } = await supabase!
    .from("signature_taxonomies")
    .select("*");
  if (taxonomyError)
    return res
      .status(503)
      .json({ message: "Não foi possível validar as taxonomias." });
  const { data: previous } = await supabase!
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  const previousProperty = previous ? mapProperty(previous) : null;

  const autoLocation = p.addressSource === "google";
  const located =
    p.latitude !== null &&
    p.latitude !== undefined &&
    p.latitude !== "" &&
    p.longitude !== null &&
    p.longitude !== undefined &&
    p.longitude !== "";
  if (
    autoLocation &&
    (!/^\d{8}$/.test(String(p.postalCode || "")) ||
      !/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(
        p.stateCode || "",
      ) ||
      !p.neighborhood?.trim() ||
      !located ||
      !Number.isFinite(Number(p.latitude)) ||
      !Number.isFinite(Number(p.longitude)) ||
      Math.abs(Number(p.latitude)) > 90 ||
      Math.abs(Number(p.longitude)) > 180)
  )
    return res.status(400).json({
      message:
        "Consulte o CEP e confirme cidade, bairro, UF e localização antes de salvar.",
    });
  for (const key of [
    "city",
    "neighborhood",
    "street",
    "addressNumber",
    "addressComplement",
    "placeId",
  ])
    if (
      p[key] !== undefined &&
      (typeof p[key] !== "string" || p[key].length > 180)
    )
      return res
        .status(400)
        .json({ message: "Campo de endereço inválido: " + key });

  const selections = [
    ["type", "category"],
    ["city", "city"],
    ["neighborhood", "neighborhood"],
    ["status", "condition"],
  ];
  for (const [kind, key] of selections) {
    if (!p[key] || (autoLocation && ["city", "neighborhood"].includes(kind)))
      continue;
    const term = registered?.find(
      (t: any) =>
        t.kind === kind &&
        t.label === p[key] &&
        (kind !== "neighborhood" ||
          registered?.find((c: any) => c.id === t.parent_id)?.label === p.city),
    );
    const unchanged =
      previousProperty &&
      (previousProperty[key] ||
        (key === "city" ? previousProperty.location : "")) === p[key] &&
      (kind !== "neighborhood" || previousProperty.location === p.city);
    if ((!term || !term.active) && !unchanged)
      return res
        .status(400)
        .json({ message: "Selecione uma taxonomia ativa para " + key + "." });
  }
  for (const feature of Array.isArray(p.features) ? p.features : []) {
    if (
      !registered?.some(
        (t: any) =>
          t.kind === "feature" &&
          t.label === feature &&
          t.active &&
          t.meta?.scope !== "unit",
      ) &&
      !previousProperty?.features?.includes(feature)
    )
      return res.status(400).json({
        message: "Característica não cadastrada ou inativa: " + feature,
      });
  }
  for (const plan of Array.isArray(p.floorplans) ? p.floorplans : [])
    for (const feature of plan.features || []) {
      if (
        !registered?.some(
          (t: any) =>
            t.kind === "feature" &&
            t.label === feature &&
            t.active &&
            t.meta?.scope === "unit",
        ) &&
        !previousProperty?.floorplans?.some((old: any) =>
          (old.features || []).includes(feature),
        )
      )
        return res.status(400).json({
          message: "Característica de planta não cadastrada: " + feature,
        });
    }
  const meta = {
    slug: slug(p.slug || p.title),
    category: p.category,
    city: p.city,
    neighborhood: p.neighborhood || "",
    postalCode: String(p.postalCode || "").replace(/\D/g, ""),
    street: p.street || "",
    addressNumber: p.addressNumber || "",
    addressComplement: p.addressComplement || "",
    stateCode: p.stateCode || "",
    latitude: autoLocation ? Number(p.latitude) : null,
    longitude: autoLocation ? Number(p.longitude) : null,
    placeId: autoLocation ? p.placeId || "" : "",
    addressSource: autoLocation ? "google" : "",
    locationPrecision:
      autoLocation &&
      ["postal_code", "address", "manual_pin"].includes(p.locationPrecision)
        ? p.locationPrecision
        : "",
    cityTermId:
      previousProperty?.city === p.city
        ? previousProperty?.cityTermId || ""
        : "",
    neighborhoodTermId:
      previousProperty?.city === p.city &&
      previousProperty?.neighborhood === p.neighborhood
        ? previousProperty?.neighborhoodTermId || ""
        : "",
    condition: p.condition || "",
    delivery: p.delivery || "",
    youtube: p.youtube || "",
    features: Array.isArray(p.features) ? p.features : [],
    condominiumImage: [...(p.images || []), ...(p.gallery || [])].includes(p.condominiumImage) ? p.condominiumImage : "",
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
  const { data, error } = autoLocation
    ? await supabase!.rpc("signature_save_located_property", {
        property_row: row,
      })
    : await supabase!.from("properties").upsert(row).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(mapProperty(data));
});
router.post("/admin/catalog/taxonomies", async (req: any, res: any) => {
  const t = req.body;
  if (
    !["type", "status", "city", "neighborhood", "feature"].includes(t.kind) ||
    typeof t.label !== "string" ||
    !t.label.trim() ||
    t.label.length > 120 ||
    !slug(t.slug || t.label)
  )
    return res.status(400).json({ message: "Informe um nome e slug válidos." });
  if (
    t.kind === "status" &&
    !["Pronto", "Na planta", "Lançamento"].includes(t.label.trim())
  )
    return res
      .status(400)
      .json({ message: "Use Pronto, Na planta ou Lançamento." });
  const { data: terms, error: readError } = await supabase!
    .from("signature_taxonomies")
    .select("*");
  if (readError)
    return res
      .status(503)
      .json({ message: "Não foi possível verificar as taxonomias." });
  const old = terms?.find((x: any) => x.id === t.id);
  if (t.id && !old)
    return res.status(404).json({ message: "Taxonomia não encontrada." });
  if (old && old.kind !== t.kind)
    return res.status(400).json({ message: "O grupo não pode ser alterado." });
  const parent = terms?.find((x: any) => x.id === t.parent_id);
  if (t.kind === "neighborhood" && (!parent || parent.kind !== "city"))
    return res
      .status(400)
      .json({ message: "Selecione a cidade deste bairro." });
  if (t.kind === "type" && t.parent_id) {
    if (!parent || parent.kind !== "type")
      return res.status(400).json({ message: "Tipo superior inválido." });
    let cursor = parent;
    const visited = new Set();
    while (cursor) {
      if (cursor.id === t.id || visited.has(cursor.id))
        return res
          .status(400)
          .json({ message: "A hierarquia não pode formar um ciclo." });
      visited.add(cursor.id);
      cursor = terms?.find((x: any) => x.id === cursor.parent_id);
    }
  }
  if (
    terms?.some(
      (x: any) =>
        x.id !== t.id &&
        x.kind === t.kind &&
        (x.slug === slug(t.slug || t.label) ||
          (slug(x.label) === slug(t.label) &&
            (t.kind !== "neighborhood" || x.parent_id === t.parent_id))),
    )
  )
    return res.status(409).json({
      message: "Já existe um termo com este nome ou slug neste grupo.",
    });
  if (!Number.isInteger(Number(t.sort_order || 0)))
    return res
      .status(400)
      .json({ message: "A ordem deve ser um número inteiro." });
  if (old?.kind === "neighborhood" && old.parent_id !== t.parent_id) {
    const { data: rows } = await supabase!.from("properties").select("*");
    const oldCity = terms?.find((x: any) => x.id === old.parent_id)?.label;
    if (
      rows?.some(
        (p: any) =>
          neighborhood(p) === old.label &&
          (p.signature_meta?.city || p.location) === oldCity,
      )
    )
      return res.status(409).json({
        message:
          "Este bairro tem imóveis vinculados. Atualize a localização deles antes de mudar a cidade.",
      });
  }
  if (
    old?.kind === "feature" &&
    (old.meta?.scope || "property") !== (t.meta?.scope || "property")
  ) {
    const { data: rows } = await supabase!.from("properties").select("*");
    if (
      rows?.some(
        (p: any) =>
          (p.signature_meta?.features || []).includes(old.label) ||
          (p.floorplans || []).some((plan: any) =>
            (plan.features || []).includes(old.label),
          ),
      )
    )
      return res.status(409).json({
        message:
          "Esta característica está em uso. Mantenha sua aplicação ou crie outro termo.",
      });
  }
  const row = {
    id: t.id || t.kind + "-" + randomUUID(),
    kind: t.kind,
    label: t.label.trim(),
    slug: slug(t.slug || t.label),
    parent_id: ["type", "neighborhood"].includes(t.kind)
      ? t.parent_id || null
      : null,
    show_home: t.kind === "type" && !!t.show_home,
    active: t.active !== false,
    sort_order: Number(t.sort_order) || 0,
    meta: {
      stateCode: old?.meta?.stateCode || "",
      origin: old?.meta?.origin || "manual",
      description: String(t.meta?.description || "").slice(0, 3000),
      icon: /^[a-z-]{1,40}$/.test(String(t.meta?.icon || "")) ? t.meta.icon : "check",
      seoTitle: String(t.meta?.seoTitle || "").slice(0, 160),
      seoDescription: String(t.meta?.seoDescription || "").slice(0, 320),
      indexable: !!t.meta?.indexable,
      filterable: t.meta?.filterable !== false,
      scope: ["property", "condominium", "unit"].includes(t.meta?.scope)
        ? t.meta.scope
        : "property",
    },
  };
  const { data, error } = await supabase!.rpc("signature_save_taxonomy", {
    term: row,
  });
  if (error)
    return res.status(400).json({
      message:
        error.code === "23505"
          ? "Este slug já está cadastrado."
          : "Não foi possível salvar a taxonomia.",
    });
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
    source: property
      ? "property"
      : b.source === "pagina-contato"
        ? "pagina-contato"
        : "newsletter",
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
