import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { catalogRequest, propertyHref, propertyLocation } from "@/lib/catalog";
import PropertyPresentation from "./property-presentation";
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
  useEffect(() => {
    if (!p) return;
    const previous = document.title;
    const title = p.seoTitle || `${p.title} | Imóveis Lopes Signature`;
    const description =
      p.seoDescription ||
      `${p.title}: ${p.area} m², ${p.suites} suítes em ${propertyLocation(p)}.`;
    const url = window.location.origin + propertyHref(p);
    document.title = title;
    const restore: (() => void)[] = [];
    const setMeta = (name: string, value: string, property = false) => {
      const selector = property ? "property" : "name";
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${selector}="${name}"]`,
      );
      if (el) {
        const old = el.content;
        restore.push(() => {
          el!.content = old;
        });
      } else {
        el = document.createElement("meta");
        el.setAttribute(selector, name);
        document.head.appendChild(el);
        restore.push(() => el!.remove());
      }
      el.content = value;
    };
    setMeta("description", description);
    setMeta(
      "robots",
      p.indexable === false ? "noindex,follow" : "index,follow",
    );
    for (const [name, value] of [
      ["og:title", title],
      ["og:description", description],
      ["og:url", url],
    ])
      setMeta(name, value, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (p.images?.[0]) {
      const image = new URL(p.images[0], window.location.origin).href;
      setMeta("og:image", image, true);
      setMeta("og:image:alt", p.title, true);
      setMeta("twitter:image", image);
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
    canonical.href = url;
    return () => {
      document.title = previous;
      restore.forEach((f) => f());
    };
  }, [p]);

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
