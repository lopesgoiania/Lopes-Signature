import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import {
  catalogRequest,
  propertyHref,
  propertyLocation,
  type CatalogProperty,
} from "@/lib/catalog";
import type { Post } from "@/lib/journal";
import { ResponsiveImage } from "./responsive-image";
export function journalPropertyMatches(
  post: Post,
  properties: CatalogProperty[],
) {
  const text = `${post.title} ${post.summary}`.toLowerCase();
  const neighborhoods = ["jardim goiás", "marista", "bueno"].filter((n) =>
    text.includes(n),
  );
  const curation = post.category === "Imóveis & Curadoria";
  if (!neighborhoods.length && !curation) return [];
  return properties
    .filter(
      (p) =>
        Number(p.price) >= 2000000 &&
        p.images?.length &&
        (curation ||
          neighborhoods.some((n) =>
            String(p.neighborhood || "")
              .toLowerCase()
              .includes(n),
          )),
    )
    .slice(0, 2);
}
export function JournalProperties({ post }: { post: Post }) {
  const { data = [] } = useQuery<CatalogProperty[]>({
    queryKey: ["/api/properties"],
    queryFn: () => catalogRequest("properties"),
  });
  const matches = journalPropertyMatches(post, data);
  if (!matches.length) return null;
  return (
    <section className="jr-property-selection">
      <div className="jr-section-title">
        <h2>Do repertório ao endereço.</h2>
        <Link href="/imoveis">
          Explore o catálogo <ArrowUpRight size={17} />
        </Link>
      </div>
      <p>
        Uma seleção do catálogo para continuar sua pesquisa. Confirme os
        detalhes de cada imóvel com a equipe.
      </p>
      <div className="jr-property-grid">
        {matches.map((p) => (
          <Link key={p.id} href={propertyHref(p)}>
            <ResponsiveImage
              src={p.images[0]}
              alt={p.title}
              width={800}
              height={500}
              loading="lazy"
            />
            <span>{propertyLocation(p)}</span>
            <h3>
              {p.title} <ArrowUpRight size={18} />
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
