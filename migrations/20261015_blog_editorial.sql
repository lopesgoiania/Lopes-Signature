-- Apply after inspecting the existing blog policies and taking a database backup.
-- Existing articles retain their published state. New records default to draft.
BEGIN;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE public.blog_posts ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE public.blog_posts ALTER COLUMN published SET DEFAULT false;
UPDATE public.blog_posts SET status = 'draft' WHERE published = false AND status = 'published';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.blog_posts SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts(slug) WHERE slug IS NOT NULL;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permite inserção e edição no blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Acesso de leitura pública ao blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Leitura editorial publicada" ON public.blog_posts;
CREATE POLICY "Leitura editorial publicada" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true AND status = 'published' AND (published_at IS NULL OR published_at <= now()));
-- Also restrict SELECT when another permissive read policy exists.
DROP POLICY IF EXISTS "Restringir rascunhos públicos" ON public.blog_posts;
CREATE POLICY "Restringir rascunhos públicos" ON public.blog_posts AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (published = true AND status = 'published' AND (published_at IS NULL OR published_at <= now()));
-- Unknown permissive legacy policies must not reopen direct browser writes.
DROP POLICY IF EXISTS "Bloquear inserção direta editorial" ON public.blog_posts;
CREATE POLICY "Bloquear inserção direta editorial" ON public.blog_posts AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "Bloquear edição direta editorial" ON public.blog_posts;
CREATE POLICY "Bloquear edição direta editorial" ON public.blog_posts AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Bloquear exclusão direta editorial" ON public.blog_posts;
CREATE POLICY "Bloquear exclusão direta editorial" ON public.blog_posts AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);
-- Backend writes use the service-role key AFTER checking the administrative session.
COMMIT;
