export async function requestSiteRebuild(): Promise<
  "requested" | "failed" | "not_configured"
> {
  if (!process.env.SITE_REBUILD_HOOK_URL) return "not_configured";
  try {
    const response = await fetch(process.env.SITE_REBUILD_HOOK_URL, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return "requested";
  } catch {
    /* The database write remains valid; surface a rebuild failure separately. */
  }
  console.error(
    "Conteúdo salvo, mas a atualização do site precisa ser repetida.",
  );
  return "failed";
}
