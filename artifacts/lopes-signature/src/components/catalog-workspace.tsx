import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogRequest,
  uploadMedia,
  slugify,
  propertyHref,
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
  "w-full rounded-xl border border-white/15 bg-[#171717] px-3 py-2.5 text-sm text-white";
const button =
  "rounded-xl border border-primary/40 px-4 py-2 text-sm text-primary";
const blank = () => ({
  title: "",
  slug: "",
  category: "Apartamentos",
  city: "Goiânia",
  neighborhood: "",
  address: "",
  price: 0,
  area: 0,
  suites: 0,
  bedrooms: 0,
  bathrooms: 0,
  parking: 0,
  condition: "",
  delivery: "",
  description: "",
  images: [],
  gallery: [],
  floorplans: [],
  features: [],
  youtube: "",
  seoTitle: "",
  seoDescription: "",
  indexable: true,
  published: false,
  featured: true,
  "100bug_id_lanc": "",
});
export function CatalogWorkspace() {
  const qc = useQueryClient();
  const properties = useQuery<any[]>({
    queryKey: ["admin-catalog"],
    queryFn: () => catalogRequest("admin/catalog/properties"),
  });
  const terms = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const [mode, setMode] = useState("list");
  const [p, setP] = useState<any>(blank);
  const [baseline, setBaseline] = useState("");
  const [section, setSection] = useState("Dados do imóvel");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = mode === "edit" && JSON.stringify(p) !== baseline;
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const navigate = (next: string) => {
    if (dirty && !window.confirm("Descartar as alterações não salvas?")) return;
    setMode(next);
    setMessage("");
  };
  const start = (item?: any) => {
    const next = item
      ? {
          ...blank(),
          ...item,
          city: item.city || item.location,
          neighborhood: item.neighborhood || "",
          gallery: item.gallery || [],
          floorplans: item.floorplans || [],
        }
      : blank();
    setP(next);
    setBaseline(JSON.stringify(next));
    setSection("Dados do imóvel");
    setMode("edit");
    setMessage("");
  };
  const change = (key: string, value: any) =>
    setP((old: any) => ({ ...old, [key]: value }));
  const list = (kind: string) =>
    terms.data?.filter((t) => t.kind === kind && t.active) || [];
  const field = (key: string, label: string, type = "text") => (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <input
        className={input}
        type={type}
        min={type === "number" ? 0 : undefined}
        value={p[key] ?? ""}
        onChange={(e) =>
          change(
            key,
            type === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
    </label>
  );
  const select = (key: string, label: string, options: string[]) => (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <select
        className={input}
        value={p[key] || ""}
        onChange={(e) => {
          change(key, e.target.value);
          if (key === "city") change("neighborhood", "");
        }}
      >
        <option value="">Selecionar</option>
        {[...new Set([p[key], ...options].filter(Boolean))].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );
  const check = (key: string, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!p[key]}
        onChange={(e) => change(key, e.target.checked)}
      />
      {label}
    </label>
  );
  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await catalogRequest("admin/catalog/properties", {
        ...p,
        slug: p.slug || slugify(p.title),
      });
      setP(result);
      setBaseline(JSON.stringify(result));
      await qc.invalidateQueries({ queryKey: ["admin-catalog"] });
      await qc.invalidateQueries({ queryKey: ["catalog-property"] });
      await qc.invalidateQueries({ queryKey: ["/api/properties"] });
      setMessage("Imóvel salvo no catálogo.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  async function addFiles(files: FileList | null, key: string) {
    if (!files) return;
    setBusy(true);
    setMessage("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadMedia(file));
      setP((old: any) => ({ ...old, [key]: [...old[key], ...urls] }));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const media = (key: string, title: string) => (
    <div>
      <h3 className="mb-3 text-lg">{title}</h3>
      <label className={button}>
        Enviar fotos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          className="mt-3 block text-xs"
          onChange={(e) => {
            addFiles(e.target.files, key);
            e.target.value = "";
          }}
        />
      </label>
      <div className="my-4 flex gap-2">
        <input
          className={input}
          placeholder="Ou cole uma URL de imagem"
          id={`url-${key}`}
        />
        <button
          type="button"
          className={button}
          onClick={() => {
            const el = document.getElementById(
              `url-${key}`,
            ) as HTMLInputElement;
            if (/^https?:\/\//.test(el.value)) {
              change(key, [...p[key], el.value]);
              el.value = "";
            } else setMessage("Informe uma URL http ou https válida.");
          }}
        >
          Adicionar
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {p[key].map((url: string, i: number) => (
          <div
            key={`${url}-${i}`}
            className="rounded-xl border border-white/10 p-2"
          >
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            {key === "images" && i === 0 && (
              <p className="mt-2 text-xs text-primary">Imagem de destaque</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                className="text-xs"
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const items = [...p[key]];
                  [items[i - 1], items[i]] = [items[i], items[i - 1]];
                  change(key, items);
                }}
              >
                ↑ Mover
              </button>
              <button
                className="text-xs text-red-300"
                type="button"
                onClick={() =>
                  change(
                    key,
                    p[key].filter((_: any, n: number) => n !== i),
                  )
                }
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="serif text-3xl">Imóveis</h2>
          <p className="mt-2 text-sm text-white/60">Catálogo Lopes Signature</p>
        </div>
        <div className="flex gap-2">
          <button className={button} onClick={() => navigate("list")}>
            Todos os imóveis
          </button>
          <button
            className={button}
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Descartar as alterações não salvas?")
              )
                start();
            }}
          >
            Adicionar imóvel
          </button>
          <button className={button} onClick={() => navigate("taxonomies")}>
            Taxonomias
          </button>
        </div>
      </div>
      <p role="status" className="mb-4 text-sm text-primary">
        {message}
      </p>
      {mode === "taxonomies" ? (
        <TaxonomyWorkspace />
      ) : mode === "list" ? (
        <>
          <input
            aria-label="Pesquisar imóveis no painel"
            className={`${input} mb-5 max-w-lg`}
            placeholder="Pesquisar por nome ou bairro"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {properties.isLoading ? (
            <p>Carregando…</p>
          ) : properties.error ? (
            <p role="alert">{(properties.error as Error).message}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {["Imóvel", "Condição", "Publicação", "Ações"].map((t) => (
                      <th key={t} className="p-4">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(properties.data || [])
                    .filter((i) =>
                      slugify(`${i.title} ${i.neighborhood}`).includes(
                        slugify(search),
                      ),
                    )
                    .map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="p-4">
                          <strong>{item.title}</strong>
                          <p className="mt-1 text-xs text-white/50">
                            {item.neighborhood} · {item.location}
                          </p>
                        </td>
                        <td className="p-4">
                          {item.condition || "Não informada"}
                        </td>
                        <td className="p-4">
                          {item.published === false ? "Rascunho" : "Publicado"}
                        </td>
                        <td className="p-4">
                          <button
                            className={button}
                            onClick={() => start(item)}
                          >
                            Editar
                          </button>
                          {item.published !== false && (
                            <a
                              href={propertyHref(item)}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-3 text-primary"
                            >
                              Ver imóvel
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              "Dados do imóvel",
              "Localização",
              "Fotos e galeria",
              "Plantas",
              "Vídeo",
              "SEO",
              "Integração",
            ].map((t) => (
              <button
                key={t}
                className={`${button} ${section === t ? "bg-primary/15" : ""}`}
                onClick={() => setSection(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
            {section === "Dados do imóvel" && (
              <div className="grid gap-5 md:grid-cols-2">
                {field("title", "Nome do imóvel *")}
                {select(
                  "category",
                  "Tipo de imóvel *",
                  list("type").map((t) => t.label),
                )}
                {select("condition", "Condição", [
                  "Pronto",
                  "Na planta",
                  "Lançamento",
                ])}
                {p.condition !== "Pronto" &&
                  field("delivery", "Previsão de entrega", "month")}
                {[
                  ["price", "Preço em R$"],
                  ["area", "Área em m²"],
                  ["suites", "Suítes"],
                  ["bedrooms", "Quartos"],
                  ["bathrooms", "Banheiros"],
                  ["parking", "Vagas"],
                ].map(([k, l]) => (
                  <div key={k}>{field(k, l, "number")}</div>
                ))}
                <label className="space-y-2 md:col-span-2">
                  <span>Descrição</span>
                  <textarea
                    className={input}
                    rows={7}
                    value={p.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                </label>
                <div className="space-y-3">
                  {check("published", "Publicado no site")}
                  {check("featured", "Destaque no catálogo")}
                </div>
                <div className="md:col-span-2">
                  <h3 className="mb-3">Características e diferenciais</h3>
                  <div className="flex flex-wrap gap-4">
                    {list("feature").map((t) => (
                      <label key={t.id} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.features.includes(t.label)}
                          onChange={(e) =>
                            change(
                              "features",
                              e.target.checked
                                ? [...p.features, t.label]
                                : p.features.filter(
                                    (f: string) => f !== t.label,
                                  ),
                            )
                          }
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {section === "Localização" && (
              <div className="grid gap-5 md:grid-cols-2">
                {select(
                  "city",
                  "Cidade *",
                  list("city").map((t) => t.label),
                )}
                {select(
                  "neighborhood",
                  "Bairro",
                  list("neighborhood")
                    .filter(
                      (t) =>
                        !t.parent_id ||
                        list("city").find((c) => c.id === t.parent_id)
                          ?.label === p.city,
                    )
                    .map((t) => t.label),
                )}
                {field("address", "Endereço")}
              </div>
            )}
            {section === "Fotos e galeria" && (
              <div className="space-y-8">
                {media("images", "Imagens do imóvel — a primeira é o destaque")}
                {media("gallery", "Galeria complementar")}
                <p className="text-xs text-white/50">
                  JPG, PNG ou WebP, até 3 MB por arquivo.
                </p>
              </div>
            )}
            {section === "Plantas" && (
              <div className="space-y-6">
                {p.floorplans.map((plan: any, i: number) => {
                  const update = (k: string, v: any) =>
                    change(
                      "floorplans",
                      p.floorplans.map((a: any, n: number) =>
                        n === i ? { ...a, [k]: v } : a,
                      ),
                    );
                  return (
                    <div
                      key={i}
                      className="grid gap-4 rounded-xl border border-white/10 p-4 md:grid-cols-2"
                    >
                      {[
                        ["title", "Nome da planta"],
                        ["area", "Área m²"],
                        ["suites", "Suítes"],
                        ["parking", "Vagas"],
                        ["price", "Preço R$"],
                        ["image", "URL da planta"],
                      ].map(([k, l]) => (
                        <label key={k} className="space-y-2 text-sm">
                          <span>{l}</span>
                          <input
                            className={input}
                            value={plan[k] ?? ""}
                            type={
                              ["area", "suites", "parking", "price"].includes(k)
                                ? "number"
                                : "text"
                            }
                            min="0"
                            onChange={(e) => update(k, e.target.value)}
                          />
                        </label>
                      ))}
                      {plan.image && (
                        <img
                          src={plan.image}
                          alt={plan.title || "Planta"}
                          className="h-40 object-contain"
                        />
                      )}
                      <label className="text-sm">
                        Enviar imagem da planta
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          disabled={busy}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setBusy(true);
                            try {
                              update("image", await uploadMedia(file));
                            } catch (err) {
                              setMessage((err as Error).message);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        />
                      </label>
                      <button
                        className={button}
                        onClick={() =>
                          change(
                            "floorplans",
                            p.floorplans.filter((_: any, n: number) => n !== i),
                          )
                        }
                      >
                        Remover planta
                      </button>
                    </div>
                  );
                })}
                <button
                  className={button}
                  onClick={() =>
                    change("floorplans", [
                      ...p.floorplans,
                      {
                        title: "",
                        image: "",
                        area: "",
                        suites: "",
                        parking: "",
                        price: "",
                      },
                    ])
                  }
                >
                  Adicionar planta
                </button>
              </div>
            )}
            {section === "Vídeo" && (
              <div>
                {field("youtube", "URL do vídeo no YouTube")}
                <p className="mt-3 text-sm text-white/60">
                  A aba de vídeo aparece no site quando houver um vídeo
                  cadastrado.
                </p>
              </div>
            )}
            {section === "SEO" && (
              <div className="space-y-5">
                {field("slug", "Endereço da página /imoveis/")}
                <p className="text-xs text-white/50">
                  {propertyHref({ ...p, slug: p.slug || slugify(p.title) })}
                </p>
                {field("seoTitle", "Título para busca")}
                {field("seoDescription", "Descrição para busca")}
                {check("indexable", "Permitir indexação da página")}
              </div>
            )}
            {section === "Integração" && (
              <div>
                {field(
                  "100bug_id_lanc",
                  "ID do lançamento no CRM — 100bug_id_lanc",
                )}
                <p className="mt-3 text-sm text-white/60">
                  O identificador fica vinculado ao contato enviado por esta
                  ficha. A configuração do webhook e a importação da City serão
                  concluídas na segunda etapa.
                </p>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 mt-5 flex items-center justify-between rounded-2xl bg-[#202020] p-4">
            <p className="text-sm text-white/60">
              {dirty ? "Alterações não salvas" : "Cadastro atualizado"}
            </p>
            <button
              disabled={busy}
              className="metal-button rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-50"
              onClick={save}
            >
              {busy ? "Salvando…" : "Salvar imóvel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function TaxonomyWorkspace() {
  const qc = useQueryClient();
  const { data: terms = [], error } = useQuery<Taxonomy[]>({
    queryKey: ["taxonomies"],
    queryFn: () => catalogRequest("taxonomies"),
  });
  const [kind, setKind] = useState("type");
  const empty = (k: string) => ({
    kind: k,
    label: "",
    slug: "",
    parent_id: "",
    show_home: false,
    active: true,
    sort_order: 0,
  });
  const [item, setItem] = useState<any>(empty("type"));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {Object.entries(kinds).map(([k, label]) => (
          <button
            key={k}
            className={`${button} ${kind === k ? "bg-primary/15" : ""}`}
            onClick={() => {
              setKind(k);
              setItem(empty(k));
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p role="alert">Não foi possível carregar as taxonomias.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <form
          className="space-y-4 rounded-2xl border border-white/10 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await catalogRequest("admin/catalog/taxonomies", item);
              await qc.invalidateQueries({ queryKey: ["taxonomies"] });
              setItem(empty(kind));
              setMessage("Taxonomia salva.");
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>
            {item.id ? "Editar" : "Adicionar"} — {kinds[kind]}
          </h3>
          <label className="block text-sm">
            Nome
            <input
              className={`${input} mt-2`}
              required
              value={item.label}
              onChange={(e) => setItem({ ...item, label: e.target.value })}
            />
          </label>
          {kind === "neighborhood" && (
            <label className="block text-sm">
              Cidade
              <select
                className={`${input} mt-2`}
                required
                value={item.parent_id}
                onChange={(e) =>
                  setItem({ ...item, parent_id: e.target.value })
                }
              >
                <option value="">Selecionar cidade</option>
                {terms
                  .filter((t) => t.kind === "city")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <label className="block text-sm">
            Ordem
            <input
              type="number"
              className={`${input} mt-2`}
              value={item.sort_order}
              onChange={(e) =>
                setItem({ ...item, sort_order: Number(e.target.value) })
              }
            />
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) => setItem({ ...item, active: e.target.checked })}
            />
            Ativa
          </label>
          {kind === "type" && (
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.show_home}
                onChange={(e) =>
                  setItem({ ...item, show_home: e.target.checked })
                }
              />
              Exibir como opção na home quando houver imóveis
            </label>
          )}
          <button disabled={busy} className={button}>
            {busy ? "Salvando…" : "Salvar taxonomia"}
          </button>
          <button
            type="button"
            className="ml-3 text-sm"
            onClick={() => setItem(empty(kind))}
          >
            Limpar
          </button>
          <p role="status" className="text-sm text-primary">
            {message}
          </p>
        </form>
        <div className="space-y-2">
          {terms
            .filter((t) => t.kind === kind)
            .map((t) => (
              <button
                key={t.id}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 p-4 text-left"
                onClick={() => setItem(t)}
              >
                <span>
                  {t.label}
                  <small className="ml-3 text-white/50">
                    {t.active ? "Ativa" : "Inativa"}
                    {t.show_home ? " · Home" : ""}
                  </small>
                </span>
                <span className="text-sm text-primary">Editar</span>
              </button>
            ))}
          <p className="pt-3 text-xs text-white/50">
            Desative termos para deixar de oferecê-los em novos cadastros. Os
            imóveis existentes conservam os valores cadastrados.
          </p>
        </div>
      </div>
    </div>
  );
}
