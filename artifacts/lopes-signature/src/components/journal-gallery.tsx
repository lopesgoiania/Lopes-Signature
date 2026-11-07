import { Link } from "wouter";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { postHref, type Post } from "@/lib/journal";
import media from "@/lib/journal-media.json";
import { ResponsiveImage } from "./responsive-image";

export const recentPosts = (posts: Post[]) =>
  [...posts].sort(
    (a, b) =>
      (Date.parse(b.publishedAt || "") || 0) -
      (Date.parse(a.publishedAt || "") || 0),
  );
export function postMedia(post: Post) {
  return (
    post.imageMeta ||
    media.find((m) => m.src === post.image) ||
    (!post.image
      ? media.find(
          (m) =>
            m.id ===
            (/flamboyant|jardim goi[aá]s/i.test(post.title)
              ? "flamboyant"
              : /arquitetura/i.test(post.category)
                ? "art-deco"
                : "vaca-brava"),
        )
      : undefined)
  );
}
export function JournalPhoto({
  post,
  priority = false,
}: {
  post: Post;
  priority?: boolean;
}) {
  const image = postMedia(post);
  return (
    <ResponsiveImage
      src={post.image || image?.src}
      alt={image?.alt || post.title}
      width={1600}
      height={1067}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className="jr-photo"
    />
  );
}
export function JournalMeta({ post }: { post: Post }) {
  return (
    <div className="jr-meta">
      <span>{post.category}</span>
      <span>{[post.date, post.readTime].filter(Boolean).join(" · ")}</span>
    </div>
  );
}
export function JournalCard({
  post,
  compact = false,
  priority = false,
}: {
  post: Post;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <article className={`jr-story ${compact ? "jr-story-compact" : ""}`}>
      <Link href={postHref(post)} className="jr-story-link">
        <div className="jr-photo-frame">
          <JournalPhoto post={post} priority={priority} />
        </div>
        <div className="jr-story-copy">
          <JournalMeta post={post} />
          <h3>
            {post.title}
            <ArrowUpRight aria-hidden="true" size={21} />
          </h3>
          <p>{post.summary}</p>
          <span className="jr-read">
            Ler matéria <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
export function JournalGallery({
  posts,
  priority = false,
}: {
  posts: Post[];
  priority?: boolean;
}) {
  const [lead, ...rest] = recentPosts(posts).slice(0, 3);
  if (!lead) return null;
  return (
    <div className={`jr-recent ${rest.length ? "" : "jr-recent-single"}`}>
      <JournalCard post={lead} priority={priority} />
      <div className="jr-recent-side">
        {rest.map((post) => (
          <JournalCard key={post.id} post={post} compact />
        ))}
        {!rest.length && (
          <aside className="jr-editor-note">
            <h3>
              A cidade muda.
              <br />O olhar acompanha.
            </h3>
            <p>
              Goiânia, seus bairros e os movimentos que transformam a maneira de
              morar e construir patrimônio.
            </p>
            <div className="jr-editor-topics">
              <span>Cidade e bairros</span>
              <span>Arquitetura e vida</span>
              <span>Mercado e patrimônio</span>
            </div>
            <p className="jr-note-small">
              Novas leituras entram aqui conforme são publicadas.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
export function HomeJournal({
  posts,
  loading,
  error,
  retry,
}: {
  posts: Post[];
  loading: boolean;
  error: boolean;
  retry: () => unknown;
}) {
  if (!loading && !error && !posts.length) return null;
  return (
    <section id="blog" className="hp-journal hp-container hp-section jr-home">
      <div className="hp-section-heading">
        <h2>
          Goiânia sob
          <br />
          <em>novas perspectivas.</em>
        </h2>
        <div>
          <p>
            Os últimos artigos do Journal Signature. Cidade, arquitetura e
            patrimônio para ampliar seu olhar.
          </p>
          <Link href="/journal" className="hp-text-link">
            Explorar o Journal <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
      {loading ? (
        <p role="status">Preparando as leituras…</p>
      ) : error ? (
        <p role="alert">
          Não foi possível carregar o Journal.{" "}
          <button onClick={retry} className="hp-text-link">
            Tentar novamente
          </button>
        </p>
      ) : (
        <JournalGallery posts={posts} />
      )}
    </section>
  );
}
