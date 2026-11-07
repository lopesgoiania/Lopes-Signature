-- Aplicar depois de 20261015_blog_editorial.sql.
BEGIN;
CREATE TABLE IF NOT EXISTS public.blog_generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('running','completed','failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  post_id text,
  error text,
  rebuild_status text
);
ALTER TABLE public.blog_generation_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blog_generation_runs FROM anon, authenticated;
GRANT ALL ON public.blog_generation_runs TO service_role;
CREATE OR REPLACE FUNCTION public.claim_blog_generation(p_day date) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE claimed uuid;
BEGIN
  -- A deterministic article id also protects retries after a process interruption.
  IF EXISTS (SELECT 1 FROM public.blog_posts WHERE id = 'ai-' || p_day::text) THEN RETURN NULL; END IF;
  INSERT INTO public.blog_generation_runs(day,status) VALUES(p_day,'running')
  ON CONFLICT(day) DO UPDATE SET status='running', started_at=now(), finished_at=NULL, error=NULL
  WHERE blog_generation_runs.status='failed'
     OR (blog_generation_runs.status='running' AND blog_generation_runs.started_at < now() - interval '15 minutes')
  RETURNING id INTO claimed;
  RETURN claimed;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_blog_generation(date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_blog_generation(date) TO service_role;
COMMIT;
