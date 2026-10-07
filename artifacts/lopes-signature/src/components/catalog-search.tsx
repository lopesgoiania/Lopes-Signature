import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  catalogRequest,
  slugify,
  taxonomyMatches,
  type Taxonomy,
} from "@/lib/catalog";
const EMPTY_TERMS: Taxonomy[] = [];
export function CatalogSearch({
  properties,
  onResults,
  initialType = "",
  home = false,
  initialTerm,
}: {
  properties: any[];
  onResults: (items: any[]) => void;
  initialType?: string;
  home?: boolean;
  initialTerm?: Taxonomy;
}) {
  const { data: terms = EMPTY_TERMS } = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const [draft, setDraft] = useState({
    search: "",
    city: "",
    neighborhood: "",
    type: initialType,
    min: "",
    max: "",
    area: "",
    suites: "",
    feature: "",
    condition: "",
  });
  const [filters, setFilters] = useState(draft);
  const [open, setOpen] = useState(false);
  const results = useMemo(
    () =>
      properties.filter((p) => {
        if (initialTerm && !taxonomyMatches(p, initialTerm, terms))
          return false;
        const q = slugify(filters.search);
        return (
          (!q ||
            slugify(`${p.title} ${p.location} ${p.neighborhood}`).includes(
              q,
            )) &&
          (!filters.city || (p.city || p.location) === filters.city) &&
          (!filters.neighborhood || p.neighborhood === filters.neighborhood) &&
          (!filters.type ||
            (terms.some((t) => t.kind === "type" && t.label === filters.type)
              ? terms.some(
                  (t) =>
                    t.kind === "type" &&
                    t.label === filters.type &&
                    taxonomyMatches(p, t, terms),
                )
              : slugify(p.category || "").includes(slugify(filters.type)))) &&
          (!filters.min || p.price >= Number(filters.min)) &&
          (!filters.max || p.price <= Number(filters.max)) &&
          (!filters.area || p.area >= Number(filters.area)) &&
          (!filters.suites || p.suites >= Number(filters.suites)) &&
          (!filters.condition || p.condition === filters.condition) &&
          (!filters.feature ||
            (p.features || []).includes(filters.feature) ||
            (p.floorplans || []).some((plan: any) =>
              (plan.features || []).includes(filters.feature),
            ))
        );
      }),
    [properties, filters, initialTerm, terms],
  );
  useEffect(() => onResults(results), [results, onResults]);
  const available = (kind: string) =>
    terms.filter(
      (t) =>
        t.kind === kind &&
        t.active &&
        (kind !== "neighborhood" ||
          terms.some((c) => c.id === t.parent_id && c.active)) &&
        properties.some((p) => taxonomyMatches(p, t, terms)),
    );
  const cities = available("city").map((t) => t.label);
  const neighborhoods = available("neighborhood")
    .filter(
      (t) =>
        !draft.city ||
        terms.find((c) => c.id === t.parent_id)?.label === draft.city,
    )
    .map((t) => t.label);
  const types = available("type").filter((t) => !home || t.show_home);
  const set = (key: string, value: string) =>
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === "city" ? { neighborhood: "" } : {}),
    }));
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFilters(draft);
        }}
        className="rounded-3xl border border-border bg-card p-3"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            aria-label="Buscar imóveis"
            placeholder="Busque por bairro ou nome"
            className="min-w-0 flex-1 rounded-xl bg-background p-3 text-sm"
            value={draft.search}
            onChange={(e) => set("search", e.target.value)}
          />
          <select
            aria-label="Cidade"
            className="rounded-xl bg-background p-3 text-sm"
            value={draft.city}
            onChange={(e) => set("city", e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Bairro"
            className="rounded-xl bg-background p-3 text-sm"
            value={draft.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
          >
            <option value="">Todos os bairros</option>
            {neighborhoods.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-primary/30 px-4 py-3 text-sm"
          >
            Filtros
          </button>
          <button className="metal-button rounded-xl px-5 py-3 text-sm font-bold">
            Buscar imóveis
          </button>
        </div>
        {open && (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-3">
            <select
              aria-label="Tipo de imóvel"
              className="rounded-xl bg-background p-3"
              value={draft.type}
              onChange={(e) => set("type", e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {available("type").map((t) => (
                <option key={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              aria-label="Status do imóvel"
              className="rounded-xl bg-background p-3"
              value={draft.condition}
              onChange={(e) => set("condition", e.target.value)}
            >
              <option value="">Todos os status</option>
              {available("status").map((t) => (
                <option key={t.id}>{t.label}</option>
              ))}
            </select>
            {[
              ["min", "Valor mínimo"],
              ["max", "Valor máximo"],
              ["area", "Área mínima m²"],
              ["suites", "Suítes mínimas"],
            ].map(([key, label]) => (
              <input
                key={key}
                type="number"
                min="0"
                aria-label={label}
                placeholder={label}
                className="rounded-xl bg-background p-3"
                value={(draft as any)[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            ))}
            <select
              aria-label="Característica"
              className="rounded-xl bg-background p-3"
              value={draft.feature}
              onChange={(e) => set("feature", e.target.value)}
            >
              <option value="">Todas as características</option>
              {terms
                .filter(
                  (t) =>
                    t.kind === "feature" &&
                    t.active &&
                    t.meta?.filterable !== false &&
                    properties.some(
                      (p) =>
                        (p.features || []).includes(t.label) ||
                        (p.floorplans || []).some((plan: any) =>
                          (plan.features || []).includes(t.label),
                        ),
                    ),
                )
                .map((t) => (
                  <option key={t.id}>{t.label}</option>
                ))}
            </select>
          </div>
        )}
      </form>
      {home && (
        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              aria-pressed={filters.type === t.label}
              onClick={() => {
                const next = {
                  ...draft,
                  type: filters.type === t.label ? "" : t.label,
                };
                setDraft(next);
                setFilters(next);
              }}
              className="rounded-full border bg-card px-4 py-3 text-xs"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span aria-live="polite">
          {results.length}{" "}
          {results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </span>
        <button
          onClick={() => {
            const next = {
              search: "",
              city: "",
              neighborhood: "",
              type: initialType,
              min: "",
              max: "",
              area: "",
              suites: "",
              feature: "",
              condition: "",
            };
            setDraft(next);
            setFilters(next);
          }}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
