import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogRequest } from "@/lib/catalog";
import { postHref, type Post } from "@/lib/journal";
import { ArticleBody } from "./article-body";
import "@/pages/journal-page.css";

type Draft = Partial<Post> & { status: string };
const empty = (): Draft => ({
  title: "",
  summary: "",
  content: "",
  category: "Journal",
  author: "Lopes Signature",
  slug: "",
  image: "",
  status: "draft",
  sources: [],
});
export function EditorialWorkspace() {
  const readiness = useQuery<{
    openaiConfigured: boolean;
    serviceRoleConfigured: boolean;
    cronConfigured: boolean;
    automationSchemaReady: boolean;
    lastRun: {
      status: string;
      error?: string;
      rebuild_status?: string;
      started_at: string;
    } | null;
    schemaReady: boolean;
    databaseAvailable: boolean;
    rebuildConfigured: boolean;
  }>({
    retry: false,
    queryKey: ["admin-blog-status"],
    queryFn: () => catalogRequest("admin/blog/status"),
  });
  const query = useQuery<(Post & { status: string })[]>({
    retry: false,
    queryKey: ["admin-blog"],
    queryFn: () => catalogRequest("admin/blog"),
  });
  const [draft, setDraft] = useState<Draft>(empty);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [sources, setSources] = useState("");
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function select(post?: Post & { status: string }) {
    if (
      dirty &&
      !window.confirm("Descartar as alterações não salvas deste artigo?")
    )
      return;
    setDraft(post || empty());
    setSources(
      (post?.sources || []).map((s) => `${s.title} | ${s.url}`).join("\n"),
    );
    setDirty(false);
    setError("");
    setMessage("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !readiness.data?.schemaReady) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const parsed = sources
        .split("\n")
        .filter((s) => s.trim())
        .map((line) => {
          const divider = line.lastIndexOf("|");
          return {
            title: divider >= 0 ? line.slice(0, divider).trim() : "",
            url: divider >= 0 ? line.slice(divider + 1).trim() : line.trim(),
          };
        });
      const result = await catalogRequest("admin/blog", {
        ...draft,
        sources: parsed,
      });
      setDraft(result.post);
      setDirty(false);
      await query.refetch();
      setMessage(
        result.rebuild === "not_needed"
          ? "Rascunho salvo. Ele não aparece no Journal público."
          : result.rebuild === "requested"
            ? "Artigo salvo. A atualização das páginas foi solicitada."
            : result.rebuild === "failed"
              ? "Artigo salvo. A atualização das páginas falhou e precisa ser repetida."
              : "Artigo salvo no banco. Publique uma nova versão do site para atualizar o HTML e o sitemap.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Seu texto foi mantido.",
      );
    } finally {
      setPending(false);
    }
  }
  async function generateArticle() {
    setPending(true);
    setError("");
    setMessage(
      "Pesquisando fontes e preparando o artigo. Isso pode levar alguns minutos…",
    );
    try {
      const result = await catalogRequest("admin/blog/generate", {});
      setMessage(
        result.status === "skipped"
          ? result.message
          : result.rebuild === "requested"
            ? "Artigo publicado no banco. Atualização das páginas solicitada."
            : "Artigo salvo, mas a atualização das páginas falhou. Use Atualizar site para repetir.",
      );
      await Promise.all([query.refetch(), readiness.refetch()]);
    } catch (e) {
      setMessage("");
      setError(
        e instanceof Error ? e.message : "Não foi possível gerar o artigo.",
      );
    } finally {
      setPending(false);
    }
  }
  async function retryPublication() {
    setPending(true);
    setError("");
    try {
      const result = await catalogRequest("admin/blog/rebuild", {});
      await readiness.refetch();
      setMessage(
        result.rebuild === "requested"
          ? "Atualização do site solicitada."
          : "Não foi possível solicitar a atualização. Confira o hook da Vercel.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao atualizar o site.");
    } finally {
      setPending(false);
    }
  }
  const field = (key: keyof Draft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">Journal Signature</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pesquisa e publicação sobre Goiânia e o mercado de alto padrão.
            Segunda, quarta e sexta, às 9h (Brasília).
          </p>
        </div>
        <button
          onClick={() => select()}
          className="min-h-11 rounded-xl border px-5"
        >
          Novo artigo
        </button>
      </div>
      <section
        className="rounded-xl border p-5 space-y-3"
        aria-label="Agente editorial"
      >
        <h2 className="serif text-2xl">Agente editorial</h2>
        <p className="text-sm">
          Pesquisa tendências, consulta fontes e publica um artigo original. No
          máximo um artigo por dia, incluindo gerações manuais.
        </p>
        {readiness.isLoading && (
          <p role="status" className="text-sm">
            Conferindo acesso e configurações do agente…
          </p>
        )}
        {readiness.isError && (
          <p role="alert" className="text-sm">
            O diagnóstico das configurações está indisponível. Consulte o motivo
            abaixo; os botões ficam bloqueados até o acesso ser restabelecido.
          </p>
        )}
        {readiness.data && (
          <p className="text-sm">
            OpenAI:{" "}
            {readiness.data.openaiConfigured ? "configurada" : "pendente"} ·
            Banco da automação:{" "}
            {readiness.data.automationSchemaReady &&
            readiness.data.serviceRoleConfigured
              ? "pronto"
              : "pendente"}{" "}
            · Agendamento:{" "}
            {readiness.data.cronConfigured
              ? "chave configurada"
              : "chave pendente"}{" "}
            · Publicação:{" "}
            {readiness.data.rebuildConfigured ? "configurada" : "pendente"}
          </p>
        )}
        {readiness.data?.lastRun && (
          <p className="text-sm">
            Última execução:{" "}
            {readiness.data.lastRun.status === "completed"
              ? "concluída"
              : readiness.data.lastRun.status === "failed"
                ? "falhou"
                : "em andamento"}
            . {readiness.data.lastRun.error}{" "}
            {readiness.data.lastRun.rebuild_status === "failed"
              ? "A atualização do site precisa ser repetida."
              : ""}
          </p>
        )}
        <button
          type="button"
          className="min-h-11 rounded-xl border px-5 disabled:opacity-50"
          onClick={generateArticle}
          disabled={
            pending ||
            !readiness.data?.schemaReady ||
            !readiness.data?.automationSchemaReady ||
            !readiness.data?.openaiConfigured ||
            !readiness.data?.serviceRoleConfigured ||
            !readiness.data?.rebuildConfigured
          }
        >
          {pending ? "Aguarde…" : "Pesquisar e publicar com IA"}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl border px-5 ml-2 disabled:opacity-50"
          onClick={retryPublication}
          disabled={pending || !readiness.data?.rebuildConfigured}
        >
          Atualizar site
        </button>
      </section>
      {readiness.isLoading ? (
        <p role="status">Verificando o editor…</p>
      ) : readiness.isError ? (
        <div role="alert" className="rounded-xl border border-border p-5">
          <p>
            {readiness.error instanceof Error
              ? readiness.error.message
              : "Não foi possível verificar o editor. Tente novamente."}
          </p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => readiness.refetch()}
          >
            Verificar novamente
          </button>
        </div>
      ) : !readiness.data?.schemaReady ? (
        <div role="status" className="rounded-xl border border-border p-5">
          <h2 className="serif text-2xl">
            O editor precisa concluir sua configuração.
          </h2>
          <p className="mt-3 text-sm leading-6">
            {readiness.data?.databaseAvailable
              ? "O banco do Journal ainda precisa da atualização editorial. Você pode preparar e visualizar o texto abaixo; o salvamento será liberado depois da atualização."
              : "Não foi possível acessar o banco do Journal. O salvamento será liberado quando a conexão for restabelecida."}
          </p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => readiness.refetch()}
          >
            Verificar novamente
          </button>
        </div>
      ) : !readiness.data.rebuildConfigured ? (
        <p
          role="status"
          className="rounded-xl border border-border p-5 text-sm leading-6"
        >
          O editor está pronto para salvar. A atualização automática das páginas
          públicas ainda precisa ser configurada; publique uma nova versão do
          site após alterar um artigo público.
        </p>
      ) : null}
      {query.isLoading ? (
        <p role="status">Carregando artigos…</p>
      ) : query.isError ? (
        <div role="alert">
          <p>
            {query.error instanceof Error
              ? query.error.message
              : "Não foi possível carregar os artigos."}
          </p>
          <button
            className="min-h-11 underline"
            onClick={() => query.refetch()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {query.data?.map((post) => (
            <button
              key={post.id}
              onClick={() => select(post)}
              aria-pressed={draft.id === post.id}
              className="min-h-11 rounded-xl border px-4 py-3 text-left text-sm"
            >
              {post.title}
              <span className="ml-3 text-muted-foreground">
                {post.status === "published"
                  ? "Publicado"
                  : post.status === "archived"
                    ? "Arquivado"
                    : "Rascunho"}
              </span>
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={save}
        className="space-y-5 rounded-2xl border border-border bg-card p-5 md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(
            [
              ["title", "Título"],
              ["slug", "Endereço do artigo (slug)"],
              ["category", "Categoria"],
              ["author", "Autoria"],
              ["image", "Imagem (URL)"],
              ["seoTitle", "Título para os buscadores"],
            ] as [keyof Draft, string][]
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                className="admin-input mt-2"
                value={String(draft[key] || "")}
                onChange={(e) => field(key, e.target.value)}
                required={key === "title"}
                maxLength={key === "image" ? 2000 : 200}
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          Resumo
          <textarea
            className="admin-input mt-2 min-h-24"
            value={draft.summary}
            onChange={(e) => field("summary", e.target.value)}
            required
            maxLength={1000}
          />
        </label>
        <label className="block text-sm">
          Descrição para os buscadores
          <textarea
            className="admin-input mt-2 min-h-20"
            value={draft.seoDescription || ""}
            onChange={(e) => field("seoDescription", e.target.value)}
            maxLength={500}
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label htmlFor="article-content" className="text-sm">
            Conteúdo em Markdown ou HTML
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            aria-pressed={preview}
            className="min-h-11 underline"
          >
            {preview ? "Editar texto" : "Visualizar conteúdo"}
          </button>
        </div>
        <textarea
          id="article-content"
          hidden={preview}
          className="admin-input min-h-80"
          value={draft.content}
          onChange={(e) => field("content", e.target.value)}
          required
          maxLength={100000}
        />
        {preview && (
          <div className="article-body rounded-xl bg-background p-6">
            <ArticleBody content={draft.content || ""} />
          </div>
        )}
        <label className="block text-sm">
          Fontes (uma por linha: título | URL)
          <textarea
            className="admin-input mt-2 min-h-24"
            value={sources}
            onChange={(e) => {
              setSources(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="block text-sm">
          Estado editorial
          <select
            className="admin-input mt-2"
            value={draft.status}
            onChange={(e) => field("status", e.target.value)}
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </label>
        <p className="text-sm text-muted-foreground">
          Revise fontes, números, datas e informações comerciais antes de
          publicar. Rascunhos e artigos arquivados não aparecem na API pública.
        </p>
        <div className="flex flex-wrap gap-5">
          <button
            disabled={pending || !readiness.data?.schemaReady}
            className="metal-button min-h-11 rounded-xl px-6 py-3 font-bold disabled:opacity-50"
          >
            {pending
              ? "Salvando…"
              : draft.status === "published"
                ? "Salvar e publicar"
                : "Salvar artigo"}
          </button>
          {draft.id && draft.published && (
            <a
              href={postHref(draft as Post)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center underline"
            >
              Abrir artigo público
            </a>
          )}
        </div>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
      </form>
    </div>
  );
}
