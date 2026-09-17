import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// POST /api/webhooks/100bug - Receber webhook do CRM
router.post("/webhooks/100bug", async (req, res) => {
  logger.info({ body: req.body }, "Recebido Webhook do 100bug");

  if (!isSupabaseConfigured || !supabase) {
    logger.warn("Supabase não configurado. Ignorando webhook.");
    res.status(503).json({ error: "Serviço indisponível" });
    return;
  }

  try {
    const payload = req.body;
    const crmId = payload.id || payload.codigo || String(Date.now());
    
    const { error } = await supabase
      .from("crm_sync_queue")
      .upsert({
        crm_id: String(crmId),
        payload: payload,
        status: 'pending'
      }, { onConflict: "crm_id" });

    if (error) {
      logger.error({ error, payload }, "Erro ao inserir/atualizar webhook na fila crm_sync_queue");
      res.status(500).json({ error: "Erro interno no banco de dados" });
      return;
    }

    res.status(200).json({ message: "Webhook adicionado à fila de sincronização com sucesso" });
  } catch (error) {
    logger.error({ error }, "Falha ao processar webhook do 100bug");
    res.status(500).json({ error: "Falha ao processar payload" });
  }
});

export default router;
