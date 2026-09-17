-- ==========================================
-- LOPES SIGNATURE - SCHEMAS DO SUPABASE (VERSÃO IDEMPOTENTE)
-- Execute este script no SQL Editor do seu projeto Supabase
-- Não gera nenhum erro mesmo se executado várias vezes!
-- ==========================================

-- 1. Tabela de Empreendimentos / Produtos (Imóveis)
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  builder TEXT,
  address TEXT,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  area NUMERIC NOT NULL,
  bedrooms INT DEFAULT 0,
  suites INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  parking INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  floorplans JSONB DEFAULT '[]',
  gallery TEXT[] DEFAULT '{}',
  description TEXT,
  pdf_url TEXT,
  lp_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela do Blog (Notícias & Artigos da IA)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  date TEXT,
  read_time TEXT,
  author TEXT DEFAULT 'IA Lopes Signature',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Métricas e Análise de Tráfego
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'lp_view', 'raiox_view', 'whatsapp_click'
  page_url TEXT,
  property_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Leads / Inscrições de Curadoria
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_id TEXT,
  property_title TEXT,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'website',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela Pública de Usuários Administradores (Visível no Table Editor do Supabase)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'Gestor Signature',
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas com DROP IF EXISTS prévio (Evita erro 42710 "policy already exists")
DROP POLICY IF EXISTS "Acesso de leitura pública aos produtos" ON public.properties;
CREATE POLICY "Acesso de leitura pública aos produtos" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permite inserção e edição de produtos" ON public.properties;
CREATE POLICY "Permite inserção e edição de produtos" ON public.properties FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso de leitura pública ao blog" ON public.blog_posts;
CREATE POLICY "Acesso de leitura pública ao blog" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permite inserção e edição no blog" ON public.blog_posts;
CREATE POLICY "Permite inserção e edição no blog" ON public.blog_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso público analytics" ON public.analytics_events;
CREATE POLICY "Acesso público analytics" ON public.analytics_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso público leads" ON public.leads;
CREATE POLICY "Acesso público leads" ON public.leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso público admin_users" ON public.admin_users;
CREATE POLICY "Acesso público admin_users" ON public.admin_users FOR ALL USING (true);

-- Função e Trigger para espelhar automaticamente usuários do auth.users para public.admin_users
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

-- Espelhar usuários existentes em auth.users imediatamente para public.admin_users
INSERT INTO public.admin_users (auth_user_id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Gestor Signature'), 'admin'
FROM auth.users
ON CONFLICT (email) DO NOTHING;
