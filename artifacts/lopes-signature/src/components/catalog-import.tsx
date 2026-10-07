import { useState } from "react";
import {
  catalogRequest,
  slugify,
  uploadMedia,
  type Taxonomy,
} from "@/lib/catalog";

type ImportPackage = {
  format: "signature-city-v1";
  properties: Record<string, any>[];
  assets: Record<string, { name: string; type: string; content: string }>;
};

export function CatalogImport({ onComplete }: { onComplete: () => void }) {
  const [data, setData] = useState<ImportPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<string[]>([]);
  async function read(file?: File) {
    setData(null);
    setResults([]);
    try {
      if (!file || file.size > 80 * 1024 * 1024)
        throw new Error("Selecione um pacote JSON de até 80 MB.");
      const parsed = JSON.parse(await file.text()) as ImportPackage;
      if (
        parsed.format !== "signature-city-v1" ||
        !Array.isArray(parsed.properties) ||
        !parsed.properties.length ||
        parsed.properties.length > 100 ||
        !parsed.assets ||
        typeof parsed.assets !== "object"
      )
        throw new Error("Pacote de importação inválido.");
      const ids = new Set<string>();
      for (const p of parsed.properties) {
        const id = String(p["100bug_id_lanc"] || "");
        if (
          !/^\d+$/.test(id) ||
          ids.has(id) ||
          p.builder !== "City" ||
          !p.title ||
          !p.city ||
          !p.category
        )
          throw new Error("Confira os nomes e IDs dos empreendimentos City.");
        ids.add(id);
        for (const n of [
          p.price,
          p.area,
          ...(p.floorplans || []).flatMap((f: any) => [f.price, f.area]),
        ])
          if (!Number.isInteger(n) || n < 0)
            throw new Error(
              "Preços e áreas devem ser inteiros positivos ou zero.",
            );
      }
      for (const a of Object.values(parsed.assets))
        if (
          !a ||
          !["image/jpeg", "image/png", "image/webp"].includes(a.type) ||
          !/^[A-Za-z0-9+/]*={0,2}$/.test(a.content) ||
          a.content.length > 4 * 1024 * 1024
        )
          throw new Error("Imagem inválida ou acima de 3 MB.");
      setData(parsed);
      setStatus("Pacote validado. Confira a relação antes de importar.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function run() {
    if (!data || busy) return;
    setBusy(true);
    setResults([]);
    const urls = new Map<string, string>();
    try {
      const existing = (await catalogRequest(
        "admin/catalog/properties",
      )) as Record<string, any>[];
      const terms = (await catalogRequest("taxonomies")) as Taxonomy[];
      async function term(kind: string, label: string, parent_id?: string) {
        let t = terms.find(
          (t) =>
            t.kind === kind &&
            t.label === label &&
            (!parent_id || t.parent_id === parent_id),
        );
        if (t && !t.active) throw new Error("Taxonomia inativa: " + label);
        if (!t) {
          t = await catalogRequest("admin/catalog/taxonomies", {
            kind,
            label,
            slug: slugify(label),
            parent_id,
            active: true,
            show_home: true,
            sort_order: terms.length,
            meta: {
              indexable: true,
              filterable: true,
              ...(kind === "city" ? { stateCode: "GO", origin: "crm" } : {}),
            },
          });
          terms.push(t!);
        }
        return t!;
      }
      async function image(ref: string) {
        if (!ref.startsWith("asset:")) return ref;
        const key = ref.slice(6);
        if (urls.has(key)) return urls.get(key)!;
        const a = data!.assets[key];
        if (!a) throw new Error("Arquivo ausente: " + key);
        const bytes = Uint8Array.from(atob(a.content), (c) => c.charCodeAt(0));
        const url = await uploadMedia(
          new File([bytes], a.name, { type: a.type }),
        );
        urls.set(key, url);
        return url;
      }
      for (let i = 0; i < data.properties.length; i++) {
        const incoming = data.properties[i];
        setStatus(
          `${i + 1}/${data.properties.length} — ${incoming.title}: enviando fotos e plantas…`,
        );
        try {
          const city = await term("city", incoming.city);
          await term("type", incoming.category);
          if (incoming.neighborhood)
            await term("neighborhood", incoming.neighborhood, city.id);
          const old =
            existing.find(
              (p) =>
                String(p["100bug_id_lanc"] || "") ===
                String(incoming["100bug_id_lanc"]),
            ) || existing.find((p) => p.slug === incoming.slug);
          const p: Record<string, any> = {
            ...old,
            ...incoming,
            ...(old ? { id: old.id } : {}),
            features: old?.features || incoming.features || [],
          };
          p.images = [];
          p.gallery = [];
          p.floorplans = [];
          for (const ref of incoming.images || [])
            p.images.push(await image(ref));
          for (const ref of incoming.gallery || [])
            p.gallery.push(await image(ref));
          for (const plan of incoming.floorplans || [])
            p.floorplans.push({
              ...plan,
              image: plan.image ? await image(plan.image) : "",
            });
          if (p.published && (!p.images.length || p.price <= 0 || p.area <= 0))
            throw new Error("Publicação exige imagem, preço e área.");
          await catalogRequest("admin/catalog/properties", p);
          setResults((r) => [
            ...r,
            `${p.title} — ${p.published ? "publicado" : "rascunho"}`,
          ]);
        } catch (e) {
          setResults((r) => [
            ...r,
            `${incoming.title} — erro: ${(e as Error).message}`,
          ]);
        }
      }
      setStatus("Importação concluída. Confira os resultados abaixo.");
      onComplete();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-2xl border border-white/15 bg-[#171717] p-6 text-white">
      <h3 className="serif text-2xl">Importar empreendimentos City</h3>
      <p className="my-3 text-sm text-white/70">
        Importa fotos, plantas e dados vinculados ao ID do CRM. Cadastros
        existentes são atualizados pelo ID ou pelo endereço da página.
      </p>
      <label className="block text-sm">
        Pacote de cadastro JSON
        <input
          className="mt-2 block"
          type="file"
          accept="application/json,.json"
          disabled={busy}
          onChange={(e) => read(e.target.files?.[0])}
        />
      </label>
      {data && (
        <>
          <p className="my-4">
            {data.properties.length} empreendimentos ·{" "}
            {Object.keys(data.assets).length} arquivos
          </p>
          <ul className="mb-4 space-y-1 text-sm">
            {data.properties.map((p) => (
              <li key={p["100bug_id_lanc"]}>
                {p.title} · ID {p["100bug_id_lanc"]} ·{" "}
                {p.published ? "Publicar" : "Rascunho"}
              </li>
            ))}
          </ul>
          <button
            className="rounded-xl border border-primary/40 px-4 py-2 text-primary"
            disabled={busy}
            onClick={run}
          >
            {busy ? "Importando…" : "Importar catálogo"}
          </button>
        </>
      )}
      <p className="my-4 text-sm text-primary" role="status">
        {status}
      </p>
      <ul className="space-y-2 text-sm">
        {results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </section>
  );
}