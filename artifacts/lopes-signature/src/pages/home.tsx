import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useListProperties } from "@workspace/api-client-react";
import { SiteFooter } from "@/components/site-footer";
import {
  PublicNav,
  PropertyCard,
  SkeletonGrid,
  ErrorState,
  EmptyState,
} from "@/components/signature-ui";
import { CatalogSearch } from "@/components/catalog-search";
import { ScrollVideoHero } from "@/components/scroll-video-hero";
import { HomeEditorial } from "@/components/home-editorial";
import { readPosts } from "@/lib/journal";
import { catalogRequest, type Taxonomy } from "@/lib/catalog";
import "./home-design-preview.css";
import "./home-lopes.css";

const EMPTY_PROPERTIES: any[] = [];
const PREFERRED = [
  "Epic City Home",
  "City Park Palace",
  "City Park Royal",
  "B. Side",
  "Legacy City Home",
  "City Park Majestic",
];

export default function HomePage() {
  const [searchRevision, setSearchRevision] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[] | null>(
    null,
  );
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("lopes-saved") || "[]");
      if (Array.isArray(parsed))
        setSaved(parsed.filter((id): id is string => typeof id === "string"));
    } catch {
      /* Browser storage is optional. */
    }
  }, []);
  const propertyQuery = useListProperties();
  const allProperties = Array.isArray(propertyQuery.data)
    ? propertyQuery.data
    : EMPTY_PROPERTIES;
  const blogQuery = useQuery({
    queryKey: ["journal-posts"],
    queryFn: readPosts,
  });
  const terms = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const results = filteredProperties ?? allProperties;
  const isFullCatalog =
    results.length === allProperties.length &&
    results.every((p, i) => p.id === allProperties[i]?.id);
  const curated = useMemo(
    () =>
      [...allProperties]
        .sort((a, b) => {
          const rank = (p: any) => {
            const index = PREFERRED.findIndex((title) =>
              p.title?.toLowerCase().includes(title.toLowerCase()),
            );
            return index < 0 ? PREFERRED.length : index;
          };
          return rank(a) - rank(b);
        })
        .slice(0, 6),
    [allProperties],
  );
  const properties = isFullCatalog ? curated : results;
  function toggleSave(id: string) {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      try {
        localStorage.setItem("lopes-saved", JSON.stringify(next));
      } catch {
        /* Preserve the selection in memory. */
      }
      return next;
    });
  }
  return (
    <div className="signature-shell home-preview min-h-[100dvh] text-foreground">
      <PublicNav />
      <main>
        <div className="hp-hero">
          <ScrollVideoHero />
        </div>
        <div className="hp-body">
          <section
            className="relative z-10 mx-auto -mt-8 max-w-[1180px] px-5 md:px-10"
            id="catalogo"
            aria-label="Buscar imóveis no catálogo"
          >
            <CatalogSearch
              key={searchRevision}
              properties={allProperties}
              onResults={setFilteredProperties}
              showCount={false}
              home
            />
          </section>
          <section id="hp-selection" className="property-listing hp-container">
            <div className="hp-section-heading">
              <h2>
                Imóveis de alto padrão
                <br />
                <em>em Goiânia.</em>
              </h2>
              <div className="hp-selection-intro">
                <p>
                  Compare projetos, plantas e localizações. Comece por uma
                  seleção do nosso catálogo.
                </p>
                <Link href="/imoveis" className="hp-text-link">
                  Explorar todos os imóveis <ArrowRight size={19} />
                </Link>
              </div>
            </div>
            {!propertyQuery.isLoading && !propertyQuery.isError && (
              <p className="hp-results-note" aria-live="polite">
                {isFullCatalog
                  ? `${properties.length} destaques de um catálogo com ${allProperties.length} imóveis`
                  : `${properties.length} ${properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"} para sua busca`}
              </p>
            )}
            {propertyQuery.isLoading ? (
              <SkeletonGrid />
            ) : propertyQuery.isError ? (
              <ErrorState onRetry={() => propertyQuery.refetch()} />
            ) : properties.length === 0 ? (
              <EmptyState
                title="Nenhum imóvel encontrado nesta busca"
                description="Tente outro bairro ou ajuste os filtros para conhecer mais opções."
                onReset={() => {
                  setFilteredProperties(null);
                  setSearchRevision((v) => v + 1);
                }}
              />
            ) : (
              <div className="listing-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    saved={saved.includes(p.id)}
                    onSave={() => toggleSave(p.id)}
                  />
                ))}
              </div>
            )}
            <div className="hp-catalog-end">
              <p>
                Gostou de mais de um? Salve os imóveis para voltar a eles
                depois.
              </p>
              <Link href="/imoveis" className="hp-text-link">
                Ver catálogo completo <ArrowRight size={19} />
              </Link>
            </div>
          </section>
          <HomeEditorial
            properties={allProperties}
            taxonomies={terms.data || []}
            posts={blogQuery.data || []}
            postsLoading={blogQuery.isLoading}
            postsError={blogQuery.isError}
            retryPosts={() => blogQuery.refetch()}
          />
        </div>
      </main>
      <div className="hp-home-footer">
        <SiteFooter />
      </div>
    </div>
  );
}
