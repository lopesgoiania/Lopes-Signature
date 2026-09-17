import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";
import { properties } from "./properties.js";

const router: IRouter = Router();

// GET /api/crm/sync - Obter itens pendentes de sincronização
router.get("/crm/sync", async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    res.status(503).json({ error: "Supabase não configurado" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("crm_sync_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error({ error }, "Erro ao listar itens pendentes da fila do CRM");
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// POST /api/crm/import - Importar (aprovar) itens da fila para o catálogo
router.post("/crm/import", async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    res.status(503).json({ error: "Supabase não configurado" });
    return;
  }

  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "Nenhum ID fornecido para importação" });
    return;
  }

  try {
    // 1. Obter os itens da fila
    const { data: queueItems, error: fetchError } = await supabase
      .from("crm_sync_queue")
      .select("*")
      .in("id", ids);

    if (fetchError || !queueItems) {
      throw fetchError;
    }

    // 2. Mapear e preparar para inserção em properties
    const newProperties = queueItems.map(item => {
      const payload = item.payload;
      const crmId = item.crm_id;
      const propertyId = `produto-${crmId}`;
      const propertyTitle = payload.titulo || payload.nome || payload.title || `Imóvel CRM #${crmId}`;
      const propertyPrice = Number(payload.valor || payload.preco || payload.price) || 0;
      
      return {
        id: propertyId,
        title: propertyTitle,
        builder: payload.construtora || "Parceiro 100bug",
        location: payload.cidade || payload.location || "Não informada",
        address: payload.endereco || payload.address || "",
        price: propertyPrice,
        area: Number(payload.areaUtil || payload.area) || 0,
        bedrooms: Number(payload.quartos || payload.dorms || payload.bedrooms) || 0,
        suites: Number(payload.suites) || 0,
        parking: Number(payload.vagas || payload.parking) || 0,
        description: payload.descricao || payload.description || "Criado via Integração CRM",
        images: Array.isArray(payload.fotos) && payload.fotos.length > 0 ? payload.fotos : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
        lp_url: "",
        status: payload.status || "Disponível",
        category: payload.categoria || "Apartamentos",
        featured: false,
        badges: ["IMPORTADO"]
      };
    });

    if (newProperties.length === 0) {
      res.json({ imported: 0 });
      return;
    }

    // 3. Inserir em properties (upsert)
    const { error: insertError } = await supabase
      .from("properties")
      .upsert(newProperties, { onConflict: "id" });

    if (insertError) throw insertError;

    // 4. Atualizar status na fila para 'imported'
    const { error: updateError } = await supabase
      .from("crm_sync_queue")
      .update({ status: 'imported' })
      .in("id", ids);

    if (updateError) throw updateError;
    
    // Atualiza a memória local (caso necessário, se estiver em cache)
    // properties é exportado de routes/properties.ts? Opcional
    
    res.json({ imported: newProperties.length, items: newProperties });
  } catch (error) {
    logger.error({ error }, "Erro ao importar itens da fila do CRM");
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// POST /api/crm/ignore - Ignorar/Deletar itens da fila
router.post("/crm/ignore", async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    res.status(503).json({ error: "Supabase não configurado" });
    return;
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "IDs inválidos" });
    return;
  }
  try {
    const { error } = await supabase
      .from("crm_sync_queue")
      .update({ status: 'ignored' })
      .in("id", ids);

    if (error) throw error;
    res.json({ ignored: ids.length });
  } catch (error) {
    logger.error({ error }, "Erro ao ignorar itens do CRM");
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

export default router;
