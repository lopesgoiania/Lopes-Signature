import { SiteFooter } from "@/components/site-footer";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { PublicNav } from "@/components/signature-ui";
import { ArticleBody } from "@/components/article-body";
import {
  JournalGallery,
  JournalCard,
  JournalPhoto,
  JournalMeta,
  postMedia,
  recentPosts,
} from "@/components/journal-gallery";
import { postHref, readPost, readPosts } from "@/lib/journal";
import { pageSeo, usePageSeo } from "@/lib/seo";
import "./journal-page.css";

const PAGE_SIZE = 9;
export default function JournalPage() {
  const { id } = useParams<{ id?: string }>();
  const search = new URLSearchParams(useSearch());
  const requestedPage = Math.max(
    1,
    Number.parseInt(search.get("pagina") || "1", 10) || 1,
  );
  const category = search.get("tema") || "";
  const listing = useQuery({ queryKey: ["journal-posts"], queryFn: readPosts });
  const article = useQuery({
    queryKey: ["journal-post", id],
    queryFn: () => readPost(id!),
    enabled: !!id,
  });
  const query = id ? article : listing;
  const post = article.data;
  const all = recentPosts(listing.data || []);
  const categories = [...new Set(all.map((p) => p.category))];
  const filtered = category ? all.filter((p) => p.category === category) : all;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (n: number, theme = category) =>
    `/journal${n > 1 || theme ? "?" + new URLSearchParams({ ...(n > 1 ? { pagina: String(n) } : {}), ...(theme ? { tema: theme } : {}) }).toString() : ""}`;
  const notFound = id && (article.error as any)?.status === 404;
  usePageSeo(
    id && post
      ? pageSeo(`/journal/${id}`, {
          properties: [],
          taxonomies: [],
          specialists: [],
          posts: [post],
        })
      : id
        ? { ...pageSeo("/journal"), path: `/journal/${id}`, noindex: true }
        : {
            ...pageSeo("/journal"),
            ...(category || requestedPage > 1 ? { noindex: true } : {}),
          },
  );
  const image = post && postMedia(post);
  const headings = post
    ? [...(post.content || "").matchAll(/^## (.+)$/gm)].map((m) => m[1])
    : [];
  return (
    <div className="signature-shell journal-page">
      <PublicNav />
      <main className="jr-shell">
        {query.isLoading ? (
          <div className="jr-loading" role="status">
            Preparando as leituras do Journal…
          </div>
        ) : notFound ? (
          <div className="jr-empty">
            <h1>Essa leitura não foi encontrada.</h1>
            <Link href="/journal">
              Voltar ao Journal <ArrowRight size={18} />
            </Link>
          </div>
        ) : query.isError ? (
          <div className="jr-empty" role="alert">
            <h1>Não foi possível carregar o Journal.</h1>
            <button onClick={() => query.refetch()}>Tentar novamente</button>
          </div>
        ) : id && post ? (
          <>
            <nav className="jr-breadcrumb" aria-label="Caminho da página">
              <Link href="/journal">
                <ArrowLeft size={16} /> Journal Signature
              </Link>
              <span>{post.category}</span>
            </nav>
            <article>
              <header className="jr-article-header">
                <JournalMeta post={post} />
                <h1>{post.title}</h1>
                <p>{post.summary}</p>
                <div className="jr-byline">
                  Por {post.author || "Redação Lopes Signature"}
                </div>
              </header>
              <figure className="jr-cover">
                <JournalPhoto post={post} priority />
                {image && (
                  <figcaption>
                    {image.caption} · Foto:{" "}
                    <a href={image.sourceUrl} target="_blank" rel="noreferrer">
                      {image.credit}
                    </a>{" "}
                    ·{" "}
                    <a
                      href={image.licenseUrl || image.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {image.license}
                    </a>
                    . Recorte editorial.
                  </figcaption>
                )}
              </figure>
              <div className="jr-reading-layout">
                <aside className="jr-reading-aside">
                  <h2>Nesta leitura</h2>
                  <ol>
                    {headings.map((title, i) => (
                      <li key={i}>
                        <a href={`#secao-${i + 1}`}>{title}</a>
                      </li>
                    ))}
                  </ol>
                  <Link href="/imoveis" className="jr-aside-link">
                    Encontre seu próximo endereço <ArrowUpRight size={18} />
                  </Link>
                </aside>
                <div>
                  <div className="article-body">
                    <ArticleBody content={post.content || ""} />
                  </div>
                  {!!post.sources?.length && (
                    <section className="jr-sources">
                      <h2>Fontes e referências</h2>
                      <p>
                        Consulte os materiais que fundamentam esta leitura e os
                        períodos dos dados citados.
                      </p>
                      <ul>
                        {post.sources
                          .filter((s) => /^https?:\/\//.test(s.url))
                          .map((s) => (
                            <li key={s.url}>
                              <a href={s.url} target="_blank" rel="noreferrer">
                                {s.title}
                                <ArrowUpRight size={15} />
                              </a>
                            </li>
                          ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            </article>
            <section className="jr-contact">
              <div>
                <h2>
                  Uma boa escolha começa
                  <br />
                  com uma boa conversa.
                </h2>
                <p>
                  Conheça os imóveis e os endereços que combinam com seu modo de
                  viver em Goiânia.
                </p>
              </div>
              <Link href="/contato">
                Converse com a Signature <ArrowUpRight size={20} />
              </Link>
            </section>
            {all.filter((p) => p.id !== post.id).length > 0 && (
              <section className="jr-related">
                <h2>Continue a leitura</h2>
                <div className="jr-archive-grid">
                  {all
                    .filter((p) => p.id !== post.id)
                    .slice(0, 3)
                    .map((p) => (
                      <JournalCard key={p.id} post={p} />
                    ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <header className="jr-masthead">
              <h1>
                Um olhar sobre a cidade.
                <br />
                <em>Uma perspectiva sobre o viver.</em>
              </h1>
              <div>
                <p>
                  Goiânia, arquitetura e os movimentos que transformam o mercado
                  imobiliário. Leituras do Journal Signature para escolher com
                  mais repertório.
                </p>
                <a href="#acervo">
                  Explore nossas leituras <ArrowRight size={17} />
                </a>
              </div>
            </header>
            {!all.length ? (
              <div className="jr-empty">
                <h2>Novas perspectivas em preparação.</h2>
                <p>Em breve, novas leituras do Journal Signature.</p>
                <Link href="/imoveis">
                  Conhecer os imóveis <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <>
                {page === 1 && !category && (
                  <section
                    className="jr-latest"
                    aria-labelledby="jr-latest-title"
                  >
                    <div className="jr-section-title">
                      <h2 id="jr-latest-title">Leituras recentes</h2>
                      <span>O último olhar, em destaque.</span>
                    </div>
                    <JournalGallery posts={all} priority />
                  </section>
                )}
                <section id="acervo" className="jr-archive">
                  <div className="jr-section-title">
                    <h2>Todos os artigos</h2>
                    <span>
                      {filtered.length}{" "}
                      {filtered.length === 1 ? "leitura" : "leituras"}
                    </span>
                  </div>
                  {categories.length > 1 && (
                    <nav
                      aria-label="Filtrar artigos por tema"
                      className="jr-filters"
                    >
                      <Link
                        href={href(1, "")}
                        aria-current={!category ? "page" : undefined}
                      >
                        Todos os temas
                      </Link>
                      {categories.map((c) => (
                        <Link
                          key={c}
                          href={href(1, c)}
                          aria-current={category === c ? "page" : undefined}
                        >
                          {c}
                        </Link>
                      ))}
                    </nav>
                  )}
                  <div className="jr-archive-grid">
                    {pagePosts.map((p) => (
                      <JournalCard key={p.id} post={p} />
                    ))}
                  </div>
                  {!filtered.length && (
                    <p>
                      Nenhuma leitura neste tema.{" "}
                      <Link href="/journal">Ver todos os temas</Link>
                    </p>
                  )}
                  {pageCount > 1 && (
                    <nav
                      className="jr-pagination"
                      aria-label="Páginas do Journal"
                    >
                      {page > 1 ? (
                        <Link href={href(page - 1)}>
                          <ArrowLeft size={17} /> Anterior
                        </Link>
                      ) : (
                        <span />
                      )}
                      <div>
                        {Array.from({ length: pageCount }, (_, i) => i + 1)
                          .filter(
                            (n) =>
                              n === 1 ||
                              n === pageCount ||
                              Math.abs(n - page) <= 1,
                          )
                          .map((n, i, visible) => (
                            <span key={n}>
                              {i > 0 && n - visible[i - 1] > 1 && (
                                <span className="jr-page-gap">…</span>
                              )}
                              <Link
                                aria-current={n === page ? "page" : undefined}
                                href={href(n)}
                              >
                                {n}
                              </Link>
                            </span>
                          ))}
                      </div>
                      {page < pageCount ? (
                        <Link href={href(page + 1)}>
                          Próxima <ArrowRight size={17} />
                        </Link>
                      ) : (
                        <span />
                      )}
                    </nav>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
