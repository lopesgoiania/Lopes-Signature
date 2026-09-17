-- ==========================================
-- APENAS A TABELA DE USUÁRIOS ADMINISTRADORES
-- Execute este bloco rápido no SQL Editor do Supabase
-- ==========================================

-- 1. Criar a tabela pública admin_users (visível no Table Editor)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'Gestor Signature',
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar segurança e política de acesso
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público admin_users" ON public.admin_users;
CREATE POLICY "Acesso público admin_users" ON public.admin_users FOR ALL USING (true);

-- 3. Trigger para novos usuários do auth.users caírem automaticamente em admin_users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (auth_user_id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Gestor Signature'), 'admin')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Puxar o usuário que você já cadastrou (lopesgynadm@gmail.com) para a tabela admin_users
INSERT INTO public.admin_users (auth_user_id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Gestor Signature'), 'admin'
FROM auth.users
ON CONFLICT (email) DO NOTHING;
