import { supabase } from './supabase.js';

export async function editorialStatus(client = supabase, rebuildConfigured = Boolean(process.env.SITE_REBUILD_HOOK_URL)) {
  if (!client) return { schemaReady: false, databaseAvailable: false, rebuildConfigured };
  const { error } = await client.from('blog_posts')
    .select('id,slug,status,published,seo_title,seo_description,sources,published_at,updated_at').limit(0);
  return {
    schemaReady: !error,
    databaseAvailable: !error || ['42703','PGRST204'].includes(error.code),
    rebuildConfigured,
  };
}
