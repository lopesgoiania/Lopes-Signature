export * from "./catalog-model";
export async function catalogRequest(path: string, body?: unknown) {
  let accessToken: string | undefined;
  if (path.startsWith("admin/")) {
    const { supabase } = await import("./supabase");
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token;
  }
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Não foi possível concluir.");
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
