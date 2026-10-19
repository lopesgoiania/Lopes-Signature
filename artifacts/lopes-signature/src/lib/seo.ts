import { useEffect } from "react";
import {
  propertyHref,
  propertyLocation,
  taxonomyHref,
  taxonomyMatches,
  slugify,
  type Taxonomy,
} from "./catalog-model";
import { postHref, type Post } from "./journal";

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://lopessignature.vercel.app"
).replace(/\/$/, "");
export type PublicSnapshot = {
  properties: any[];
  taxonomies: Taxonomy[];
  specialists: any[];
  posts: Post[];
};
export type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  status?: number;
  article?: Post;
  breadcrumbs?: { name: string; path: string }[];
};
export const staticPages: Record<
  string,
  { title: string; description: string }
> = {
  "/": {
    title: "Imóveis de alto padrão em Goiânia | Lopes Signature",
    description:
      "Explore casas, apartamentos e empreendimentos de alto padrão em Goiânia com a seleção e o atendimento da Lopes Signature.",
  },
  "/imoveis": {
    title: "Imóveis em Goiânia: catálogo | Lopes Signature",
    description:
      "Compare localização, plantas e características dos imóveis do catálogo Lopes Signature em Goiânia.",
  },
  "/sobre": {
    title: "Sobre a Lopes Signature em Goiânia",
    description:
      "Conheça a Lopes Signature, sua atuação em Goiânia e o atendimento especializado em imóveis de alto padrão.",
  },
  "/especialistas": {
    title: "Especialistas em imóveis em Goiânia | Lopes Signature",
    description:
      "Conheça a equipe Lopes Signature e encontre atendimento especializado para sua busca de imóvel em Goiânia.",
  },
  "/contato": {
    title: "Contato e atendimento em Goiânia | Lopes Signature",
    description:
      "Entre em contato com a Lopes Signature para conhecer imóveis, consultar plantas e solicitar atendimento em Goiânia.",
  },
  "/journal": {
    title:
      "Journal: arquitetura e mercado imobiliário de Goiânia | Lopes Signature",
    description:
      "Leituras sobre arquitetura, bairros e mercado imobiliário de Goiânia. Conheça o Journal Lopes Signature.",
  },
  "/casas-alto-padrao-goiania": {
    title: "Casas de alto padrão em Goiânia | Lopes Signature",
    description:
      "Consulte casas de alto padrão em Goiânia e compare localização, espaços e características no catálogo Lopes Signature.",
  },
  "/apartamentos-luxo-goiania": {
    title: "Apartamentos de luxo em Goiânia | Lopes Signature",
    description:
      "Conheça apartamentos de alto padrão em Goiânia, com plantas, localização e atendimento Lopes Signature.",
  },
  "/coberturas-goiania": {
    title: "Coberturas em Goiânia | Lopes Signature",
    description:
      "Explore coberturas em Goiânia e consulte plantas, áreas e características com a Lopes Signature.",
  },
};
export function pageSeo(path: string, data?: PublicSnapshot): PageSeo {
  path = path.split("?")[0].replace(/\/$/, "") || "/";
  if (staticPages[path]) {
    const category = (
      {
        "/casas-alto-padrao-goiania": "casa",
        "/apartamentos-luxo-goiania": "apartamento",
        "/coberturas-goiania": "cobertura",
      } as Record<string, string>
    )[path];
    return {
      ...staticPages[path],
      path,
      ...(data &&
      category &&
      !data.properties.some((p) => slugify(p.category || "").includes(category))
        ? { noindex: true }
        : {}),
    };
  }
  if (path.startsWith("/journal/") && data) {
    const id = decodeURIComponent(path.slice("/journal/".length));
    const post = data.posts.find((p) => (p.slug || p.id) === id || p.id === id);
    if (post)
      return {
        path: postHref(post),
        title: post.seoTitle || `${post.title} | Journal Lopes Signature`,
        description: post.seoDescription || post.summary,
        image: post.image,
        article: post,
        breadcrumbs: [
          { name: "Journal", path: "/journal" },
          { name: post.title, path: postHref(post) },
        ],
      };
  }
  if (path.startsWith("/imoveis/taxonomia/") && data) {
    const term = data.taxonomies.find(
      (t) => t.active && taxonomyHref(t) === path,
    );
    if (term)
      return {
        path,
        title: term.meta?.seoTitle || `${term.label} | Lopes Signature`,
        description:
          term.meta?.seoDescription ||
          term.meta?.description ||
          `Conheça os imóveis do catálogo Lopes Signature em ${term.label}.`,
        noindex:
          !term.meta?.indexable ||
          !data.properties.some((p) =>
            taxonomyMatches(p, term, data.taxonomies),
          ),
        breadcrumbs: [
          { name: "Imóveis", path: "/imoveis" },
          { name: term.label, path },
        ],
      };
  }
  if (/^\/imoveis\/[^/]+$/.test(path) && data) {
    const id = decodeURIComponent(path.slice("/imoveis/".length));
    const p = data.properties.find(
      (p) => (p.slug || p.id) === id || p.id === id,
    );
    if (p)
      return {
        path: propertyHref(p),
        title: p.seoTitle || `${p.title} | Imóveis Lopes Signature`,
        description:
          p.seoDescription ||
          `${p.title}: ${p.area} m² em ${propertyLocation(p)}. Conheça plantas e características com a Lopes Signature.`,
        image: p.images?.[0],
        noindex: p.indexable === false,
        breadcrumbs: [
          { name: "Imóveis", path: "/imoveis" },
          { name: p.title, path: propertyHref(p) },
        ],
      };
  }
  return {
    path,
    title:
      path === "/admin"
        ? "Gestão | Lopes Signature"
        : "Página não encontrada | Lopes Signature",
    description:
      "Consulte o catálogo ou entre em contato com a Lopes Signature.",
    noindex: true,
    status: path === "/admin" || path.startsWith("/previa/") ? 200 : 404,
  };
}
export function seoSchemas(seo: PageSeo, origin = SITE_URL) {
  if (seo.noindex) return [];
  const absolute = (path: string) => new URL(path, origin).href;
  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "Lopes Signature",
      url: origin,
      logo: absolute("/images/logo-signature.png"),
    },
  ];
  if (seo.breadcrumbs)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ name: "Início", path: "/" }, ...seo.breadcrumbs].map(
        (item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absolute(item.path),
        }),
      ),
    });
  if (seo.article) {
    const post = seo.article;
    const iso = (date?: string) =>
      date && !Number.isNaN(Date.parse(date))
        ? new Date(date).toISOString()
        : undefined;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      mainEntityOfPage: absolute(seo.path),
      ...(post.image ? { image: absolute(post.image) } : {}),
      ...(post.author
        ? {
            author: {
              "@type": /lopes|curadoria|agente|\bia\b/i.test(post.author)
                ? "Organization"
                : "Person",
              name: post.author,
            },
          }
        : {}),
      publisher: { "@id": `${origin}/#organization` },
      datePublished: iso(post.publishedAt),
      dateModified: iso(post.updatedAt) || iso(post.publishedAt),
    });
  }
  return schemas;
}
export function usePageSeo(seo?: PageSeo) {
  useEffect(() => {
    if (!seo) return;
    document.title = seo.title;
    const set = (key: string, value: string, attr = "name") => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.append(el);
      }
      el.content = value;
    };
    set("description", seo.description);
    set(
      "robots",
      seo.noindex ? "noindex,follow" : "index,follow,max-image-preview:large",
    );
    const url = new URL(seo.path, SITE_URL).href;
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
    for (const [name, value] of Object.entries({
      "og:title": seo.title,
      "og:description": seo.description,
      "og:url": url,
      "og:type": seo.article ? "article" : "website",
      "og:image": new URL(
        seo.image || "/images/signature-hero-poster.jpg",
        SITE_URL,
      ).href,
    }))
      set(name, value, "property");
    set("twitter:title", seo.title);
    set("twitter:description", seo.description);
    set(
      "twitter:image",
      new URL(seo.image || "/images/signature-hero-poster.jpg", SITE_URL).href,
    );
    let schema = document.querySelector<HTMLScriptElement>("#page-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "page-schema";
      schema.type = "application/ld+json";
      document.head.append(schema);
    }
    schema.textContent = JSON.stringify(seoSchemas(seo)).replace(
      /</g,
      "\\u003c",
    );
  }, [
    seo?.title,
    seo?.description,
    seo?.path,
    seo?.image,
    seo?.noindex,
    seo?.article,
  ]);
}
