import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  CreateLeadBody,
  CreateLeadResponse,
  ListLeadsResponse,
  UpdateLeadBody,
  UpdateLeadParams,
  UpdateLeadResponse,
} from "@workspace/api-zod";

export let leads: any[] = [];

const router: IRouter = Router();

router.get("/leads", async (_req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone || "",
          propertyId: item.property_id || "",
          propertyTitle: item.property_title || "",
          status: (item.status || "new") as any,
          source: item.source || "Website",
          createdAt: item.created_at || new Date().toISOString(),
          note: item.note || "",
        }));
        res.json(ListLeadsResponse.parse(mapped));
        return;
      }
    } catch (e) {
      console.warn("Erro ao buscar leads no Supabase, usando memória:", e);
    }
  }

  res.json(ListLeadsResponse.parse(leads));
});

router.post("/leads", async (req, res) => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Dados do lead inválidos." });
    return;
  }

  const lead = {
    ...parsed.data,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("leads").insert({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        property_id: lead.propertyId,
        property_title: lead.propertyTitle,
        status: lead.status,
        source: lead.source,
        note: lead.note,
      });
    } catch (e) {
      console.warn("Erro ao salvar lead no Supabase:", e);
    }
  }

  leads.unshift(lead);
  res.status(201).json(CreateLeadResponse.parse(lead));
});

router.patch("/leads/:leadId", async (req, res) => {
  const params = UpdateLeadParams.safeParse(req.params);
  const body = UpdateLeadBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ message: "Dados do lead inválidos." });
    return;
  }

  const leadId = params.data.leadId;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("leads").update(body.data).eq("id", leadId);
    } catch (e) {
      console.warn("Erro ao atualizar lead no Supabase:", e);
    }
  }

  const index = leads.findIndex((lead) => lead.id === leadId);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...body.data };
    res.json(UpdateLeadResponse.parse(leads[index]));
    return;
  }

  res.status(200).json({ id: leadId, ...body.data });
});

export default router;