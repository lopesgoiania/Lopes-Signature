import { catalogRequest } from "./catalog";

export type MapsConfig = { enabled: boolean; apiKey: string; mapId: string };
export const emptyMapsConfig: MapsConfig = {
  enabled: false,
  apiKey: "",
  mapId: "",
};
let loading: Promise<any> | undefined;
let loadedKey = "";
export async function mapsConfig(): Promise<MapsConfig> {
  return catalogRequest("maps-config");
}
export function loadMaps(config: MapsConfig): Promise<any> {
  if (!config?.enabled || !config.apiKey)
    return Promise.reject(new Error("Configure o Google Maps em Integrações."));
  if (loadedKey && loadedKey !== config.apiKey)
    return Promise.reject(
      new Error("Recarregue a página para usar a nova chave."),
    );
  if (loading) return loading;
  loadedKey = config.apiKey;
  loading = new Promise((resolve, reject) => {
    const win = window as any;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 20000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      delete win.signatureMapsReady;
    };
    const fail = () => {
      cleanup();
      script.remove();
      loading = undefined;
      loadedKey = "";
      reject(
        new Error(
          "Não foi possível carregar o Google Maps. Verifique a chave e os domínios autorizados.",
        ),
      );
    };
    win.signatureMapsReady = () => {
      cleanup();
      resolve(win.google.maps);
    };
    const params = new URLSearchParams({
      key: config.apiKey,
      v: "weekly",
      language: "pt-BR",
      region: "BR",
      loading: "async",
      callback: "signatureMapsReady",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
export const addressLine = (p: Record<string, any>) =>
  [p.street, p.addressNumber, p.neighborhood, p.city, p.stateCode, p.postalCode]
    .filter(Boolean)
    .join(", ");
export function addressFromResult(result: any) {
  const get = (type: string, short = false) => {
    const c = result.address_components.find((x: any) =>
      x.types.includes(type),
    );
    return c ? c[short ? "short_name" : "long_name"] : "";
  };
  if (get("country", true) !== "BR")
    throw new Error("Selecione um endereço no Brasil.");
  return {
    postalCode: get("postal_code").replace(/\D/g, ""),
    street: get("route"),
    neighborhood:
      get("sublocality_level_1") || get("neighborhood") || get("sublocality"),
    city: get("administrative_area_level_2") || get("locality"),
    stateCode: get("administrative_area_level_1", true),
    latitude: result.geometry.location.lat(),
    longitude: result.geometry.location.lng(),
    placeId: result.place_id || "",
    addressSource: "google",
    locationPrecision: "postal_code",
  };
}
