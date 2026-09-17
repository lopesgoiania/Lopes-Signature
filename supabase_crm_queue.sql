-- Tabela para armazenar propriedades recebidas do webhook do CRM 100bug em estágio "Rascunho/Pendente"
CREATE TABLE IF NOT EXISTS public.crm_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_id VARCHAR NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'imported', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (opcional, mas recomendado)
ALTER TABLE public.crm_sync_queue ENABLE ROW LEVEL SECURITY;

-- Política de leitura/escrita para admin
DROP POLICY IF EXISTS "Admins podem ler crm_sync_queue" ON public.crm_sync_queue;
CREATE POLICY "Admins podem ler crm_sync_queue" ON public.crm_sync_queue
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.auth_user_id = auth.uid()
        )
    );

-- Permitir anon (service role) inserir via webhook sem restrições
DROP POLICY IF EXISTS "Service Role / Webhook Insert crm_sync_queue" ON public.crm_sync_queue;
CREATE POLICY "Service Role / Webhook Insert crm_sync_queue" ON public.crm_sync_queue
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
