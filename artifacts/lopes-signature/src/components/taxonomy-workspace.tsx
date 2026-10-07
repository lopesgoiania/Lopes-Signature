import { useState } from "react";
import { FeatureIconPicker, getFeatureIcon } from "@/lib/feature-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogRequest,
  taxonomyHref,
  taxonomyMatches,
  type Taxonomy,
} from "@/lib/catalog";
const kinds: Record<string, string> = {
  type: "Tipos de imóveis",
  status: "Status de imóveis",
  city: "Cidades",
  neighborhood: "Bairros",
  feature: "Características e diferenciais",
};
const input =
  "w-full rounded-xl border border-white/20 bg-[#171717] p-3 text-sm text-white";
const button =
  "rounded-xl border border-primary/40 px-4 py-3 text-sm text-primary disabled:opacity-50";
const empty = (kind: string) => ({
  kind,
  label: "",
  slug: "",
  parent_id: "",
  active: true,
  show_home: false,
  sort_order: 0,
  meta: {
    description: "",
    seoTitle: "",
    seoDescription: "",
    indexable: false,
    filterable: true,
    scope: "property",
    icon: "check",
  },
});
export function TaxonomyWorkspace() {
  const qc = useQueryClient();
  const query = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const props = useQuery<any[]>({
    queryKey: ["admin-catalog"],
    queryFn: () => catalogRequest("admin/catalog/properties"),
  });
  const terms = query.data || [],
    properties = props.data || [];
  const [kind, setKind] = useState("type"),
    [item, setItem] = useState<any>(empty("type")),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [links, setLinks] = useState<string | null>(null);
  const patch = (k: string, v: any) => setItem((p: any) => ({ ...p, [k]: v }));
  const meta = (k: string, v: any) =>
    setItem((p: any) => ({ ...p, meta: { ...p.meta, [k]: v } }));
  const linked = (t: Taxonomy) =>
    properties.filter((p) => taxonomyMatches(p, t, terms));
  const edit = (t: Taxonomy) => {
    setItem({
      ...empty(t.kind),
      ...t,
      meta: { ...empty(t.kind).meta, ...t.meta },
    });
    setMessage("");
  };
  const rows = terms.filter(
    (t) =>
      t.kind === kind &&
      `${t.label} ${t.slug} ${terms.find((p) => p.id === t.parent_id)?.label || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <div className="space-y-6 text-white">
      <header>
        <p className="mono-label text-primary">GESTÃO DO CATÁLOGO</p>
        <h1 className="serif mt-2 text-4xl">Taxonomias</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
          Organize o cadastro, as opções de busca e as páginas do catálogo. A
          visibilidade na home depende também de imóveis publicados.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {Object.entries(kinds).map(([k, label]) => (
          <button
            key={k}
            className={`${button} ${kind === k ? "bg-primary/15" : ""}`}
            aria-pressed={kind === k}
            onClick={() => {
              setKind(k);
              setItem(empty(k));
              setLinks(null);
              setSearch("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {(query.isError || props.isError) && (
        <p role="alert">
          Não foi possível carregar os vínculos.{" "}
          <button
            className={button}
            onClick={() => {
              void query.refetch();
              void props.refetch();
            }}
          >
            Tentar novamente
          </button>
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(280px,.85fr)_minmax(0,1.5fr)]">
        <form
          className="space-y-4 rounded-2xl border border-white/15 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await catalogRequest("admin/catalog/taxonomies", item);
              await Promise.all([
                qc.invalidateQueries({ queryKey: ["taxonomies"] }),
                qc.invalidateQueries({ queryKey: ["admin-catalog"] }),
                qc.invalidateQueries({ queryKey: ["catalog-property"] }),
                qc.invalidateQueries({ queryKey: ["/api/properties"] }),
              ]);
              setItem(empty(kind));
              setMessage(
                "Taxonomia salva. Os vínculos dos imóveis foram preservados.",
              );
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl">
            {item.id ? "Editar termo" : "Adicionar termo"}
          </h2>
          <label className="block text-sm">
            Nome
            {kind === "status" ? (
              <select
                className={`${input} mt-2`}
                required
                value={item.label}
                onChange={(e) => patch("label", e.target.value)}
              >
                <option value="">Selecionar</option>
                {["Pronto", "Na planta", "Lançamento"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                className={`${input} mt-2`}
                maxLength={120}
                required
                value={item.label}
                onChange={(e) => patch("label", e.target.value)}
              />
            )}
          </label>
          <label className="block text-sm">
            Slug / URL
            <input
              className={`${input} mt-2`}
              placeholder="Gerado a partir do nome"
              value={item.slug}
              onChange={(e) => patch("slug", e.target.value)}
            />
          </label>
          {["type", "neighborhood"].includes(kind) && (
            <label className="block text-sm">
              {kind === "type" ? "Tipo superior" : "Cidade"}
              <select
                className={`${input} mt-2`}
                required={kind === "neighborhood"}
                value={item.parent_id || ""}
                onChange={(e) => patch("parent_id", e.target.value)}
              >
                <option value="">
                  {kind === "type" ? "Sem tipo superior" : "Selecionar cidade"}
                </option>
                {terms
                  .filter(
                    (t) =>
                      t.kind === (kind === "type" ? "type" : "city") &&
                      t.id !== item.id,
                  )
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                      {t.active ? "" : " (inativa)"}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {kind === "feature" && (
            <label className="block text-sm">
              Aplicação
              <select
                className={`${input} mt-2`}
                value={item.meta.scope}
                onChange={(e) => meta("scope", e.target.value)}
              >
                <option value="property">Imóvel</option>
                <option value="condominium">Condomínio / empreendimento</option>
                <option value="unit">Planta</option>
              </select>
            </label>
          )}
          {kind === "feature" && <FeatureIconPicker value={item.meta.icon || "check"} onChange={value=>meta("icon",value)}/>}
          <label className="block text-sm">
            Ordem
            <input
              className={`${input} mt-2`}
              type="number"
              step="1"
              value={item.sort_order}
              onChange={(e) => patch("sort_order", Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) => patch("active", e.target.checked)}
            />
            Ativa no cadastro e na busca
          </label>
          {kind === "type" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.show_home}
                onChange={(e) => patch("show_home", e.target.checked)}
              />
              Exibir na home quando houver imóveis publicados
            </label>
          )}
          {kind === "feature" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.meta.filterable}
                onChange={(e) => meta("filterable", e.target.checked)}
              />
              Oferecer como filtro de busca
            </label>
          )}
          <details className="rounded-xl border border-white/15 p-3">
            <summary className="cursor-pointer text-sm text-primary">
              Página do termo e SEO
            </summary>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                Texto de apresentação
                <textarea
                  className={`${input} mt-2`}
                  rows={3}
                  value={item.meta.description}
                  onChange={(e) => meta("description", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Título SEO
                <input
                  className={`${input} mt-2`}
                  maxLength={160}
                  value={item.meta.seoTitle}
                  onChange={(e) => meta("seoTitle", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Descrição SEO
                <textarea
                  className={`${input} mt-2`}
                  maxLength={320}
                  value={item.meta.seoDescription}
                  onChange={(e) => meta("seoDescription", e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.meta.indexable}
                  onChange={(e) => meta("indexable", e.target.checked)}
                />
                Permitir indexação quando houver imóveis publicados
              </label>
              {item.id && (
                <a
                  className="block text-sm text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                  href={taxonomyHref(item)}
                >
                  Abrir página do termo
                </a>
              )}
            </div>
          </details>
          <div className="flex gap-3">
            <button
              disabled={busy || query.isLoading || props.isLoading}
              className={button}
            >
              {busy ? "Salvando…" : "Salvar taxonomia"}
            </button>
            <button
              type="button"
              className={button}
              onClick={() => {
                setItem(empty(kind));
                setMessage("");
              }}
            >
              Adicionar novo
            </button>
          </div>
          <p role="status" className="text-sm text-primary">
            {message}
          </p>
        </form>
        <div className="min-w-0 self-start rounded-2xl border border-white/15 p-4">
          <label className="block text-sm">
            Buscar termos
            <input
              className={`${input} my-3`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="p-3">Nome / URL</th>
                  <th className="p-3">Imóveis</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-t border-white/10 ${t.id === item.id ? "bg-primary/10" : ""}`}
                  >
                    <td className="p-3">
                      <button
                        className="text-left text-primary"
                        onClick={() => edit(t)}
                      >
                        {t.kind === "feature" && (()=>{const Icon=getFeatureIcon(t.meta?.icon);return <Icon className="mr-2 inline" size={18}/>;})()}{t.label}
                      </button>
                      <p className="mt-1 break-all text-xs text-white/60">
                        /{t.slug}
                      </p>
                      {t.parent_id && (
                        <p className="mt-1 text-xs text-white/70">
                          ↳ {terms.find((p) => p.id === t.parent_id)?.label}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-white/70">
                        {t.active ? "Ativa" : "Inativa"}
                        {t.show_home ? " · Home" : ""}
                        {t.meta?.indexable ? " · Indexação habilitada" : ""}
                      </p>
                    </td>
                    <td className="p-3">
                      <button
                        className="text-primary underline"
                        onClick={() => setLinks(links === t.id ? null : t.id)}
                        aria-label={`Ver imóveis de ${t.label}`}
                      >
                        {linked(t).length}
                      </button>
                    </td>
                    <td className="p-3">
                      <button className={button} onClick={() => edit(t)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <p className="py-5 text-white/70">
              {query.isLoading ? "Carregando…" : "Nenhum termo encontrado."}
            </p>
          )}
          {links && (
            <div className="mt-4 border-t border-white/15 pt-4">
              <h3>
                Imóveis vinculados — {terms.find((t) => t.id === links)?.label}
              </h3>
              {linked(terms.find((t) => t.id === links)!).map((p) => (
                <p key={p.id} className="mt-2 text-sm text-white/70">
                  {p.title} · {p.published === false ? "Rascunho" : "Publicado"}
                </p>
              ))}
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-white/60">
            Desative um termo para retirá-lo de novos cadastros e filtros. Os
            vínculos existentes são preservados. Renomear atualiza os imóveis
            vinculados.
          </p>
        </div>
      </div>
    </div>
  );
}
