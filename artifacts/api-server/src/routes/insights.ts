import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  GetAnalyticsSummaryResponse,
  GetAnalyticsTimeseriesResponse,
  GetTrackingSettingsResponse,
  UpdateTrackingSettingsBody,
  UpdateTrackingSettingsResponse,
} from "@workspace/api-zod";

export let memoryEvents: { eventType: string; pageUrl?: string; propertyId?: string; createdAt: string }[] = [];

let trackingSettings = {
  metaPixelId: "",
  metaEnabled: false,
  gtmContainerId: "",
  ga4MeasurementId: "",
  customHeadScript: "",
  customBodyScript: "",
};

const router: IRouter = Router();

// POST /api/analytics/event - Registrar evento real de tráfego
router.post("/analytics/event", async (req, res) => {
  const { eventType, pageUrl, propertyId } = req.body;
  if (!eventType) {
    res.status(400).json({ message: "Tipo de evento é obrigatório." });
    return;
  }

  const newEvent = {
    eventType,
    pageUrl: pageUrl || "",
    propertyId: propertyId || "",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("analytics_events").insert({
        event_type: eventType,
        page_url: pageUrl,
        property_id: propertyId,
      });
    } catch (e) {
      console.warn("Erro ao salvar analytics_event no Supabase:", e);
    }
  }

  memoryEvents.push(newEvent);
  res.status(201).json({ success: true });
});

// GET /api/analytics/summary - Resumo real baseado no banco
router.get("/analytics/summary", async (_req, res) => {
  let totalVisits = 0;
  let whatsappClicks = 0;
  let lpViews = 0;
  let formConversions = 0;

  if (isSupabaseConfigured && supabase) {
    try {
      const [eventsRes, leadsRes] = await Promise.all([
        supabase.from("analytics_events").select("event_type"),
        supabase.from("leads").select("id", { count: "exact" }),
      ]);

      if (eventsRes.data) {
        totalVisits = eventsRes.data.filter((e) => e.event_type === "page_view").length;
        whatsappClicks = eventsRes.data.filter((e) => e.event_type === "whatsapp_click").length;
        lpViews = eventsRes.data.filter((e) => e.event_type === "lp_view").length;
      }

      if (leadsRes.count !== null) {
        formConversions = leadsRes.count;
      }
    } catch (e) {
      console.warn("Erro ao ler summary no Supabase:", e);
    }
  } else {
    totalVisits = memoryEvents.filter((e) => e.eventType === "page_view").length;
    whatsappClicks = memoryEvents.filter((e) => e.eventType === "whatsapp_click").length;
    lpViews = memoryEvents.filter((e) => e.eventType === "lp_view").length;
  }

  const conversionRate = totalVisits > 0 ? Number(((formConversions / totalVisits) * 100).toFixed(1)) : 0;

  const realSummary = {
    totalVisits,
    whatsappClicks,
    lpViews,
    formConversions,
    conversionRate,
    visitsChange: 0,
    leadsChange: 0,
  };

  res.json(GetAnalyticsSummaryResponse.parse(realSummary));
});

// GET /api/analytics/timeseries - Série temporal real
router.get("/analytics/timeseries", async (_req, res) => {
  const daysMap: Record<string, { visits: number; lpViews: number; leads: number }> = {};

  // Gerar últimos 7 dias com datas formatadas
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    daysMap[label] = { visits: 0, lpViews: 0, leads: 0 };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: events } = await supabase.from("analytics_events").select("event_type, created_at");
      if (events) {
        events.forEach((ev) => {
          const dateLabel = new Date(ev.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
          if (daysMap[dateLabel]) {
            if (ev.event_type === "page_view") daysMap[dateLabel].visits += 1;
            if (ev.event_type === "lp_view") daysMap[dateLabel].lpViews += 1;
          }
        });
      }

      const { data: leads } = await supabase.from("leads").select("created_at");
      if (leads) {
        leads.forEach((ld) => {
          const dateLabel = new Date(ld.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
          if (daysMap[dateLabel]) {
            daysMap[dateLabel].leads += 1;
          }
        });
      }
    } catch (e) {
      console.warn("Erro ao montar timeseries no Supabase:", e);
    }
  } else {
    memoryEvents.forEach((ev) => {
      const dateLabel = new Date(ev.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      if (daysMap[dateLabel]) {
        if (ev.eventType === "page_view") daysMap[dateLabel].visits += 1;
        if (ev.eventType === "lp_view") daysMap[dateLabel].lpViews += 1;
      }
    });
  }

  const timeseriesList = Object.entries(daysMap).map(([label, data]) => ({
    label,
    visits: data.visits,
    lpViews: data.lpViews,
    leads: data.leads,
  }));

  res.json(GetAnalyticsTimeseriesResponse.parse(timeseriesList));
});

router.get("/tracking-settings", (_req, res) => {
  res.json(GetTrackingSettingsResponse.parse(trackingSettings));
});

router.patch("/tracking-settings", (req, res) => {
  const parsed = UpdateTrackingSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Configuração de tracking inválida." });
    return;
  }
  trackingSettings = parsed.data;
  res.json(UpdateTrackingSettingsResponse.parse(trackingSettings));
});

export default router;