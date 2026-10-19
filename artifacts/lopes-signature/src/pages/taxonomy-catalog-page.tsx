import { pageSeo, usePageSeo } from "@/lib/seo";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  catalogRequest,
  taxonomyHref,
  taxonomyMatches,
  type Taxonomy,
} from "@/lib/catalog";
import CatalogPage from "./catalog-page";
import { PublicNav } from "@/components/signature-ui";
export default function TaxonomyCatalogPage() {
  const { kind, slug } = useParams();
  const query = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const properties = useQuery<any[]>({
    queryKey: ["/api/properties"],
    queryFn: () => catalogRequest("properties"),
  });
  const term = query.data?.find(
    (t) => t.kind === kind && t.slug === slug && t.active,
  );
  const hasProperties =
    !!term &&
    !!properties.data?.some((p) => taxonomyMatches(p, term, query.data || []));
  usePageSeo(
    pageSeo(`/imoveis/taxonomia/${kind}/${slug}`, {
      properties: properties.data || [],
      taxonomies: query.data || [],
      specialists: [],
      posts: [],
    }),
  );
  if (query.isLoading)
    return (
      <div className="signature-shell min-h-screen pt-40 text-center">
        <PublicNav />
        Carregando catálogo…
      </div>
    );
  if (query.isError)
    return (
      <div className="signature-shell min-h-screen pt-40 text-center">
        <PublicNav />
        <p>Não foi possível carregar o catálogo.</p>
        <button onClick={() => query.refetch()}>Tentar novamente</button>
      </div>
    );
  if (!term)
    return (
      <div className="signature-shell min-h-screen pt-40 text-center">
        <PublicNav />
        <h1>Página não disponível</h1>
        <a href="/imoveis">Ver catálogo de imóveis</a>
      </div>
    );
  return (
    <CatalogPage
      key={term.id}
      taxonomy={term}
      title={term.label}
      description={
        term.meta?.description || "Uma seleção à altura da sua exigência."
      }
    />
  );
}
