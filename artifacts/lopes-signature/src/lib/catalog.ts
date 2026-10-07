import { supabase } from "@/lib/supabase";
export type CatalogProperty = Record<string, any> & {
  id: string;
  title: string;
  images: string[];
};
export type Taxonomy = {
  id: string;
  kind: string;
  label: string;
  slug: string;
  parent_id?: string;
  show_home: boolean;
  active: boolean;
  sort_order: number;
  meta?: {
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    indexable?: boolean;
    filterable?: boolean;
    scope?: string;
    stateCode?: string;
    origin?: string;
  };
};
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const propertyHref = (p: any) =>
  `/imoveis/${encodeURIComponent(p.slug || p.id)}`;
export function deliveryLabel(p: any) {
  if (p.condition === "Pronto") return "Entregue";
  if (!/^\d{4}-\d{2}$/.test(p.delivery || "")) return "";
  const [year, month] = p.delivery.split("-");
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return months[Number(month) - 1]
    ? `Entrega ${months[Number(month) - 1]} ${year}`
    : "";
}
export function propertyLocation(p: any) {
  const city = p.city || p.location || "";
  const parts = (p.neighborhood || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => s && !slugify(s).includes(slugify(city)));
  const neighborhood =
    parts.find((s: string) => /setor|jardim|bairro|marista|bueno/i.test(s)) ||
    parts[0] ||
    "";
  return [...new Set([neighborhood, city].filter(Boolean))].join(", ");
}
export async function catalogRequest(path: string, body?: unknown) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(data.session
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Não foi possível concluir.");
  return result;
}
export async function uploadMedia(file: File) {
  if (file.size > 3 * 1024 * 1024) throw new Error("Use arquivos de até 3 MB.");
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return (
    await catalogRequest("admin/catalog/media", {
      name: file.name,
      type: file.type,
      content,
    })
  ).url as string;
}

export const taxonomyHref = (t: Taxonomy) =>
  "/imoveis/taxonomia/" + t.kind + "/" + t.slug;
export function taxonomyMatches(
  p: any,
  t: Taxonomy,
  terms: Taxonomy[],
): boolean {
  if (t.kind === "feature")
    return (
      (p.features || []).includes(t.label) ||
      (p.floorplans || []).some((plan: any) =>
        (plan.features || []).includes(t.label),
      )
    );
  if (t.kind === "city")
    return p.cityTermId
      ? p.cityTermId === t.id
      : (p.city || p.location) === t.label &&
          (!t.meta?.stateCode ||
            !p.stateCode ||
            p.stateCode === t.meta.stateCode);
  if (t.kind === "neighborhood")
    return p.neighborhoodTermId
      ? p.neighborhoodTermId === t.id
      : p.neighborhood === t.label &&
          (p.city || p.location) ===
            terms.find((c) => c.id === t.parent_id)?.label &&
          (!t.meta?.stateCode ||
            !p.stateCode ||
            p.stateCode === t.meta.stateCode);
  if (t.kind === "status") return p.condition === t.label;
  if (t.kind === "type")
    return (
      p.category === t.label ||
      terms.some(
        (child) =>
          child.parent_id === t.id &&
          taxonomyMatches(
            p,
            child,
            terms.filter((x) => x.id !== t.id),
          ),
      )
    );
  return false;
}
