import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadMaps, mapsConfig, type MapsConfig } from "@/lib/maps";

export function GooglePropertyMap({
  property,
  config: supplied,
  onMove,
}: {
  property: any;
  config?: MapsConfig;
  onMove?: (latitude: number, longitude: number) => void;
}) {
  const query = useQuery({
    queryKey: ["maps-config"],
    queryFn: mapsConfig,
    enabled: !supplied,
    staleTime: 60000,
  });
  const config = supplied || query.data;
  const el = useRef<HTMLDivElement>(null);
  const callback = useRef(onMove);
  callback.current = onMove;
  const [error, setError] = useState("");
  const lat = Number(property.latitude),
    lng = Number(property.longitude);
  const positioned =
    property.latitude !== undefined &&
    property.latitude !== null &&
    property.latitude !== "" &&
    property.longitude !== undefined &&
    property.longitude !== null &&
    property.longitude !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;
  useEffect(() => {
    let cancelled = false;
    let marker: any;
    let listener: any;
    setError("");
    if (!positioned || !config?.enabled || !el.current) return;
    loadMaps(config)
      .then(async (google) => {
        const { Map } = await google.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.importLibrary("marker");
        if (cancelled || !el.current) return;
        const position = { lat, lng };
        const map = new Map(el.current, {
          center: position,
          zoom: 17,
          mapId: config.mapId || "DEMO_MAP_ID",
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "cooperative",
        });
        marker = new AdvancedMarkerElement({
          map,
          position,
          title: property.title || "Localização do imóvel",
          gmpDraggable: !!callback.current,
        });
        if (callback.current)
          listener = marker.addListener("dragend", () => {
            const pos = marker.position;
            callback.current?.(
              typeof pos.lat === "function" ? pos.lat() : pos.lat,
              typeof pos.lng === "function" ? pos.lng() : pos.lng,
            );
          });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      listener?.remove();
      if (marker) marker.map = null;
    };
  }, [lat, lng, positioned, config?.enabled, config?.apiKey, config?.mapId]);
  if (!positioned || !config?.enabled || query.isError)
    return onMove ? (
      <p className="text-sm text-white/60">
        O mapa estará disponível após configurar a integração e consultar o CEP.
      </p>
    ) : null;
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border">
      <div
        ref={el}
        className="h-64 w-full"
        aria-label="Mapa da localização do imóvel"
      />
      {error && (
        <p role="alert" className="p-3 text-sm">
          {error}
        </p>
      )}
      <p className="p-3 text-xs text-muted-foreground">
        {property.locationPrecision === "address" ||
        property.locationPrecision === "manual_pin"
          ? "Localização do imóvel"
          : "Localização aproximada pelo CEP"}
        {property.address ? ` · ${property.address}` : ""}
      </p>
    </div>
  );
}
