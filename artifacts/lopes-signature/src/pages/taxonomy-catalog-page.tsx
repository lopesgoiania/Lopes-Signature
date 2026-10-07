import { useEffect } from "react";
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
  useEffect(() => {
    const previous = document.title;
    document.title =
      term?.meta?.seoTitle || `${term?.label || "Catálogo"} | Lopes Signature`;
    const restore: (() => void)[] = [];
    for (const [name, value] of [
      [
        "robots",
        term?.meta?.indexable && hasProperties
          ? "index,follow"
          : "noindex,follow",
      ],
      [
        "description",
        term?.meta?.seoDescription ||
          term?.meta?.description ||
          "Catálogo Lopes Signature",
      ],
    ]) {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (el) {
        const old = el.content;
        restore.push(() => {
          el!.content = old;
        });
      } else {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
        restore.push(() => el!.remove());
      }
      el.content = value;
    }
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) {
      const old = canonical.href;
      restore.push(() => {
        canonical!.href = old;
      });
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      restore.push(() => canonical!.remove());
    }
    canonical.href =
      window.location.origin +
      (term ? taxonomyHref(term) : window.location.pathname);
    return () => {
      document.title = previous;
      restore.forEach((f) => f());
    };
  }, [term, hasProperties]);
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
      title={term.meta?.seoTitle || term.label}
      description={
        term.meta?.description ||
        `Explore os imóveis Lopes Signature em ${term.label}.`
      }
    />
  );
}
