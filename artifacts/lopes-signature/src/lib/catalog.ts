export * from "./catalog-model";
export class CatalogRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CatalogRequestError";
  }
}
export async function catalogRequest(path: string, body?: unknown) {
  let accessToken: string | undefined;
  if (path.startsWith("admin/")) {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase.auth.getSession();
    if (error)
      throw new Error(
        "Não foi possível verificar sua sessão. Entre novamente no painel.",
      );
    accessToken = data.session?.access_token;
    if (!accessToken)
      throw new CatalogRequestError(
        "Sua sessão expirou. Entre novamente no painel.",
        401,
      );
  }
  const response = await fetch(`/api/${path}`, {
    signal: AbortSignal.timeout(
      path === "admin/blog/generate" ? 280_000 : 25_000,
    ),
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      response.status === 403
        ? "Seu login foi aceito, mas sua conta não tem permissão para esta operação. Inclua o email de gestão em SIGNATURE_ADMIN_EMAILS na Vercel (Production) e publique uma nova versão."
        : result?.message ||
          (response.status === 401
            ? "Sua sessão expirou. Entre novamente no painel."
            : `Não foi possível concluir (HTTP ${response.status}).`);
    throw new CatalogRequestError(message, response.status);
  }
  if (result === null)
    throw new Error(
      "O servidor retornou uma resposta inválida. Tente novamente.",
    );
  return result;
}
export async function uploadMedia(file: File) {
  if (file.size > 3 * 1024 * 1024) throw new Error("Use arquivos de até 3 MB.");
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return (
    await catalogRequest("admin/catalog/media", {
      name: file.name,
      type: file.type,
      content,
    })
  ).url as string;
}
