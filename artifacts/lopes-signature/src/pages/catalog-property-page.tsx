import { pageSeo, usePageSeo } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { catalogRequest, propertyHref, propertyLocation } from "@/lib/catalog";
import { Presentation as PropertyPresentation } from "./property-presentation";
export default function CatalogPropertyPage() {
  const { id } = useParams();
  const {
    data: p,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["catalog-property", id],
    queryFn: () => catalogRequest(`properties/${encodeURIComponent(id || "")}`),
  });
  usePageSeo(
    p
      ? pageSeo(`/imoveis/${id}`, {
          properties: [p],
          taxonomies: [],
          specialists: [],
          posts: [],
        })
      : { ...pageSeo("/imoveis"), path: `/imoveis/${id}`, noindex: true },
  );

  if (isLoading)
    return (
      <div className="signature-shell min-h-screen p-10">
        Carregando imóvel…
      </div>
    );
  if (error || !p)
    return (
      <div className="signature-shell min-h-screen p-10">
        <Link href="/imoveis">Voltar ao catálogo</Link>
        <p>Imóvel não encontrado.</p>
      </div>
    );
  return <PropertyPresentation key={p.id} property={p} />;
}
