import { SiteFooter } from "@/components/site-footer";
import "@/components/property-listing.css";
import { taxonomyMatches, slugify, type Taxonomy } from "@/lib/catalog";
import { useQuery } from "@tanstack/react-query";
import { catalogRequest } from "@/lib/catalog";
import { CatalogSearch } from "@/components/catalog-search";
const EMPTY_PROPERTIES: any[] = [];
import { useState, useEffect } from "react";
import { useListProperties } from "@workspace/api-client-react";
import {
  PublicNav,
  PropertyCard,
  SkeletonGrid,
  ErrorState,
  EmptyState,
} from "@/components/signature-ui";
import { RaioXModal } from "@/components/raio-x-modal";
import type { Property } from "@workspace/api-client-react";

export default function CatalogPage({
  category,
  title,
  description,
  taxonomy,
}: {
  category?: string;
  title: string;
  description: string;
  taxonomy?: Taxonomy;
}) {
  const [searchRevision, setSearchRevision] = useState(0);
  const [sort, setSort] = useState("default");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("lopes-saved") || "[]");
      if (Array.isArray(parsed)) setSaved(parsed);
    } catch {
      /* Favourites are optional when browser storage is unavailable. */
    }
  }, []);
  const [selectedRaioXProperty, setSelectedRaioXProperty] =
    useState<Property | null>(null);

  const propertyQuery = useListProperties();
  const allProperties = Array.isArray(propertyQuery.data)
    ? propertyQuery.data
    : EMPTY_PROPERTIES;
  const [filteredProperties, setFilteredProperties] = useState<any[] | null>(
    null,
  );
  const terms = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const initial = allProperties.filter(
    (p) =>
      (!taxonomy || taxonomyMatches(p, taxonomy, terms.data || [])) &&
      (!category ||
        category === "empreendimento" ||
        slugify((p as any).category || "").includes(slugify(category))),
  );
  const properties = [...(filteredProperties ?? initial)]
    .filter((p) => !savedOnly || saved.includes(p.id))
    .sort((a, b) =>
      sort === "price-asc"
        ? (a.price || Infinity) - (b.price || Infinity)
        : sort === "price-desc"
          ? (b.price || 0) - (a.price || 0)
          : sort === "area"
            ? b.area - a.area
            : 0,
    );

  function toggleSave(id: string) {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("lopes-saved", JSON.stringify(next));
    } catch {
      /* Keep the current selection when browser storage is unavailable. */
    }
  }

  return (
    <div className="signature-shell catalog-layout min-h-[100dvh] text-foreground bg-background">
      <PublicNav />
      <main className="pt-32">
        <section className="property-listing mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="listing-header mb-10 max-w-2xl">
            <h1 className="serif text-4xl text-foreground md:text-5xl mt-2 mb-4">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <section className="catalog-search-layout mx-auto max-w-[1280px] px-5 md:px-10">
            <CatalogSearch
              showCount={false}
              key={searchRevision}
              initialTerm={taxonomy}
              properties={allProperties}
              onResults={setFilteredProperties}
              initialType={category === "empreendimento" ? "" : category || ""}
            />
          </section>
          <div className="catalog-results-toolbar">
            <p aria-live="polite">
              {properties.length}{" "}
              {properties.length === 1
                ? "imóvel encontrado"
                : "imóveis encontrados"}
            </p>
            <div className="catalog-results-controls">
              <label className="catalog-saved-filter">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                />{" "}
                Somente salvos
              </label>
              <label>
                Ordenar por{" "}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">Seleção Signature</option>
                  <option value="price-asc">Menor valor</option>
                  <option value="price-desc">Maior valor</option>
                  <option value="area">Maior área</option>
                </select>
              </label>
            </div>
          </div>
          {propertyQuery.isLoading ? (
            <SkeletonGrid />
          ) : propertyQuery.isError ? (
            <ErrorState onRetry={() => propertyQuery.refetch()} />
          ) : properties.length === 0 ? (
            <EmptyState
              title={
                savedOnly
                  ? "Nenhum imóvel salvo nesta seleção"
                  : "Nenhum imóvel encontrado"
              }
              description={
                savedOnly
                  ? "Use o marcador nos cartões para salvar os imóveis que deseja rever."
                  : "Refine sua busca ou fale com a equipe para mapear opções no mercado."
              }
              onReset={() => {
                setFilteredProperties(null);
                setSavedOnly(false);
                setSearchRevision((v) => v + 1);
              }}
            />
          ) : (
            <div className="listing-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  saved={saved.includes(property.id)}
                  onSave={() => toggleSave(property.id)}
                  onOpenRaioX={(prop) => setSelectedRaioXProperty(prop)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedRaioXProperty && (
        <RaioXModal
          property={selectedRaioXProperty}
          onClose={() => setSelectedRaioXProperty(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
}
