import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogRequest } from "@/lib/catalog";
import { emptyMapsConfig, type MapsConfig } from "@/lib/maps";
export function MapsWorkspace() {
  const qc = useQueryClient();
  const query = useQuery<MapsConfig>({
    queryKey: ["admin-maps"],
    queryFn: () => catalogRequest("admin/catalog/maps"),
  });
  const [config, setConfig] = useState(emptyMapsConfig),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (query.data) setConfig(query.data);
  }, [query.data]);
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      await catalogRequest("admin/catalog/maps", config);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["maps-config"] }),
        qc.invalidateQueries({ queryKey: ["admin-maps"] }),
      ]);
      setMessage("Configuração salva.");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary">
          Integrações
        </p>
        <h1 className="mt-2 text-3xl text-white">Google Maps</h1>
        <p className="mt-3 text-sm text-white/70">
          Consulta de CEP, preenchimento do endereço e localização dos imóveis.
        </p>
      </div>
      {query.isError && (
        <p role="alert" className="text-red-300">
          Não foi possível carregar a configuração.
        </p>
      )}
      <div className="space-y-5 rounded-2xl border border-white/15 bg-[#171717] p-6">
        <label className="flex gap-3 text-white">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              setConfig({ ...config, enabled: e.target.checked })
            }
          />
          Ativar Google Maps
        </label>
        <label className="block text-sm text-white/80">
          Chave de API para navegador
          <input
            type="password"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/15 bg-[#111] px-3 py-3 text-white"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
          />
        </label>
        <label className="block text-sm text-white/80">
          Map ID (opcional)
          <input
            className="mt-2 w-full rounded-xl border border-white/15 bg-[#111] px-3 py-3 text-white"
            value={config.mapId}
            onChange={(e) => setConfig({ ...config, mapId: e.target.value })}
          />
        </label>
        <p className="text-sm leading-6 text-white/70">
          Use uma chave do projeto Lopes Signature, restrita a Maps JavaScript
          API e Geocoding API e aos domínios autorizados. A chave de navegador é
          pública por natureza: as restrições devem ser configuradas no Google
          Cloud.
        </p>
        <p className="text-sm text-white/70">
          Domínio público:{" "}
          <code className="text-white">
            https://lopessignature.vercel.app/*
          </code>
        </p>
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black disabled:opacity-40"
          disabled={busy || query.isLoading || query.isError}
          onClick={save}
        >
          {busy ? "Salvando…" : "Salvar integração"}
        </button>
        {message && (
          <p role="status" className="text-sm text-white">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
