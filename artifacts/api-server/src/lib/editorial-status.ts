import { supabase } from "./supabase.js";

export async function editorialStatus(
  client = supabase,
  rebuildConfigured = Boolean(process.env.SITE_REBUILD_HOOK_URL),
) {
  const automation = {
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    cronConfigured: Boolean(process.env.CRON_SECRET),
    automationSchemaReady: false,
    lastRun: null as any,
  };
  if (client) {
    const runs = await client
      .from("blog_generation_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1);
    automation.automationSchemaReady = !runs.error;
    automation.lastRun = runs.data?.[0] || null;
  }
  if (!client)
    return {
      ...automation,
      schemaReady: false,
      databaseAvailable: false,
      rebuildConfigured,
    };
  const { error } = await client
    .from("blog_posts")
    .select(
      "id,slug,status,published,seo_title,seo_description,sources,published_at,updated_at",
    )
    .limit(0);
  return {
    ...automation,
    schemaReady: !error,
    databaseAvailable: !error || ["42703", "PGRST204"].includes(error.code),
    rebuildConfigured,
  };
}
