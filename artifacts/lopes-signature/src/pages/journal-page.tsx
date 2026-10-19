import { SiteFooter } from "@/components/site-footer";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { PublicNav } from "@/components/signature-ui";
import { ArticleBody } from "@/components/article-body";
import { postHref, readPost, readPosts } from "@/lib/journal";
import { pageSeo, usePageSeo } from "@/lib/seo";
import "./journal-page.css";

export default function JournalPage() {
  const { id } = useParams<{ id?: string }>();
  const listing = useQuery({
    queryKey: ["journal-posts"],
    queryFn: readPosts,
    enabled: !id,
  });
  const article = useQuery({
    queryKey: ["journal-post", id],
    queryFn: () => readPost(id!),
    enabled: !!id,
  });
  const query = id ? article : listing;
  const post = article.data;
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
        : pageSeo("/journal"),
  );
  return (
    <div className="signature-shell noise min-h-[100dvh] text-foreground">
      <PublicNav />
      <main className="journal-content mx-auto max-w-[1280px] px-5 pb-24 pt-40 md:px-10">
        {query.isLoading ? (
          <p role="status" className="py-12">
            Carregando leituras…
          </p>
        ) : notFound ? (
          <div className="py-12">
            <h1 className="serif text-4xl">Artigo não encontrado.</h1>
            <Link href="/journal" className="mt-6 inline-block underline">
              Voltar ao Journal
            </Link>
          </div>
        ) : query.isError ? (
          <div role="alert" className="py-12">
            <h1 className="serif text-4xl">
              Não foi possível carregar o Journal.
            </h1>
            <button
              className="mt-5 min-h-11 underline"
              onClick={() => query.refetch()}
            >
              Tentar novamente
            </button>
          </div>
        ) : id && post ? (
          <article className="mx-auto max-w-3xl">
            <nav aria-label="Caminho da página">
              <Link href="/journal" className="text-sm underline">
                ← Journal Signature
              </Link>
            </nav>
            <h1 className="serif mt-8 text-4xl leading-tight md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 text-sm text-muted-foreground">
              {[post.category, post.date, post.readTime, post.author]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-8 text-xl leading-8 text-muted-foreground">
              {post.summary}
            </p>
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                fetchPriority="high"
                className="mt-10 aspect-video w-full rounded-2xl object-cover"
              />
            )}
            <div className="article-body mt-10">
              <ArticleBody content={post.content || ""} />
            </div>
            {!!post.sources?.length && (
              <section className="mt-12 border-t pt-8">
                <h2 className="serif text-3xl">Fontes consultadas</h2>
                <ul className="mt-4 space-y-3">
                  {post.sources
                    .filter((source) => /^https?:\/\//.test(source.url))
                    .map((source) => (
                      <li key={source.url}>
                        <a
                          className="underline"
                          href={source.url}
                          rel="noreferrer"
                        >
                          {source.title || source.url}
                        </a>
                      </li>
                    ))}
                </ul>
              </section>
            )}
            <aside className="mt-14 border-t pt-8">
              <h2 className="serif text-3xl">Continue sua busca em Goiânia.</h2>
              <p className="mt-4 leading-7">
                Explore os imóveis do catálogo ou converse com a equipe Lopes
                Signature.
              </p>
              <div className="mt-5 flex flex-wrap gap-6">
                <Link href="/imoveis" className="min-h-11 underline">
                  Ver imóveis
                </Link>
                <Link href="/contato" className="min-h-11 underline">
                  Solicitar atendimento
                </Link>
              </div>
            </aside>
          </article>
        ) : (
          <>
            <h1 className="serif text-4xl md:text-6xl">
              Um olhar estendido sobre
              <br />
              <em className="font-normal text-[#876526]">o mercado de luxo.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              Arquitetura, endereços e movimentos do mercado de Goiânia, sob a
              perspectiva de quem conhece o alto luxo.
            </p>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {listing.data?.map((item) => (
                <Link
                  key={item.id}
                  href={postHref(item)}
                  className="overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/50"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground">
                      {item.category}
                    </p>
                    <h2 className="serif mt-3 text-3xl">{item.title}</h2>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {item.summary}
                    </p>
                    <p className="mt-6 text-sm text-[#876526]">Ler artigo →</p>
                  </div>
                </Link>
              ))}
            </div>
            {!listing.data?.length && (
              <p className="mt-8 rounded-2xl border border-border p-8 text-muted-foreground">
                Em breve, novas leituras do Journal Signature.
              </p>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
