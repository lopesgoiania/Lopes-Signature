import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addressFromResult,
  addressLine,
  loadMaps,
  mapsConfig,
} from "@/lib/maps";
import { GooglePropertyMap } from "./google-property-map";

export function AddressLocationEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (patch: Record<string, any>) => void;
}) {
  const query = useQuery({
    queryKey: ["maps-config"],
    queryFn: mapsConfig,
    staleTime: 60000,
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const revision = useRef(0);
  useEffect(
    () => () => {
      revision.current++;
    },
    [],
  );
  const edit = (key: string, text: string) => {
    revision.current++;
    setBusy(false);
    setError("");
    const patch = { [key]: text };
    if (key !== "addressComplement")
      Object.assign(patch, {
        latitude: null,
        longitude: null,
        placeId: "",
        addressSource: "",
        locationPrecision: "",
      });
    onChange({ ...patch, address: addressLine({ ...value, ...patch }) });
  };
  const geocode = async (postalOnly: boolean) => {
    const version = ++revision.current;
    setError("");
    setBusy(true);
    try {
      const cep = String(value.postalCode || "").replace(/\D/g, "");
      if (cep.length !== 8) throw new Error("Informe um CEP com oito dígitos.");
      if (
        !postalOnly &&
        (!value.street ||
          !value.city ||
          !value.stateCode ||
          !value.addressNumber)
      )
        throw new Error(
          "Complete rua, número, cidade e UF antes de confirmar a localização.",
        );
      const google = await loadMaps(query.data!);
      const { Geocoder } = await google.importLibrary("geocoding");
      const response = await new Geocoder().geocode(
        postalOnly
          ? {
              componentRestrictions: { country: "BR", postalCode: cep },
              region: "BR",
            }
          : {
              address: addressLine(value) + ", Brasil",
              componentRestrictions: { country: "BR" },
              region: "BR",
            },
      );
      if (version !== revision.current) return;
      if (!response.results?.length)
        throw new Error("Endereço não encontrado. Confira o CEP.");
      const patch = addressFromResult(response.results[0]);
      if (!postalOnly && (response.results[0].partial_match || !patch.street))
        throw new Error(
          "O Google não confirmou o endereço completo. Confira rua e número.",
        );
      if (patch.postalCode && patch.postalCode !== cep)
        throw new Error(
          "O Google retornou outro CEP. Confira o endereço antes de salvar.",
        );
      if (!patch.city || !patch.stateCode)
        throw new Error("O Google não identificou cidade e UF para este CEP.");
      const next = {
        ...value,
        ...patch,
        postalCode: cep,
        addressNumber: postalOnly ? "" : value.addressNumber,
        addressComplement: postalOnly ? "" : value.addressComplement,
        locationPrecision:
          !postalOnly &&
          ["ROOFTOP", "RANGE_INTERPOLATED"].includes(
            response.results[0].geometry.location_type,
          )
            ? "address"
            : "postal_code",
      };
      onChange({ ...next, address: addressLine(next) });
    } catch (e: any) {
      if (version === revision.current)
        setError(
          e?.message ||
            "Não foi possível consultar o endereço. Confira as APIs e a chave do Google Maps.",
        );
    } finally {
      if (version === revision.current) setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-white/70">
        Consulte o CEP para preencher o endereço. Cidade e bairro serão
        vinculados automaticamente às taxonomias ao salvar o imóvel.
      </p>
      {(!query.data?.enabled || query.isError) && (
        <p className="rounded-xl border border-primary/30 p-3 text-sm text-primary">
          Configure a chave da conta Lopes em Integrações → Google Maps. Os
          endereços atuais continuam disponíveis.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["postalCode", "CEP"],
          ["street", "Rua / avenida"],
          ["addressNumber", "Número"],
          ["addressComplement", "Complemento"],
          ["neighborhood", "Bairro"],
          ["city", "Cidade"],
          ["stateCode", "UF"],
        ].map(([key, label]) => (
          <label key={key} className="text-sm text-white/80">
            {label}
            <input
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#171717] px-3 py-2.5 text-white"
              value={value[key] || ""}
              maxLength={
                key === "postalCode" ? 9 : key === "stateCode" ? 2 : 180
              }
              onChange={(e) =>
                edit(
                  key,
                  key === "postalCode"
                    ? e.target.value.replace(/\D/g, "")
                    : key === "stateCode"
                      ? e.target.value.toUpperCase()
                      : e.target.value,
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !query.data?.enabled}
          className="rounded-xl border border-primary/40 px-4 py-2 text-sm text-primary disabled:opacity-40"
          onClick={() => geocode(true)}
        >
          {busy ? "Consultando…" : "Consultar CEP"}
        </button>
        <button
          type="button"
          disabled={busy || !query.data?.enabled}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-40"
          onClick={() => geocode(false)}
        >
          Confirmar localização pelo endereço
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <label className="block text-sm text-white/80">
        Endereço de exibição
        <input
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#171717] px-3 py-2.5 text-white"
          value={value.address || ""}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </label>
      <GooglePropertyMap
        property={value}
        config={query.data}
        onMove={(latitude, longitude) =>
          onChange({ latitude, longitude, locationPrecision: "manual_pin" })
        }
      />
    </div>
  );
}
