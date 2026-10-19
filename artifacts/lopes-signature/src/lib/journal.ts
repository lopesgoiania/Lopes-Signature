export type Post = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image?: string;
  date?: string;
  readTime?: string;
  author?: string;
  published?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  sources?: { title: string; url: string }[];
};
export const postHref = (post: Post) =>
  `/journal/${encodeURIComponent(post.slug || post.id)}`;
export async function readPosts(): Promise<Post[]> {
  const response = await fetch("/api/blog");
  if (!response.ok) throw new Error("Não foi possível carregar o Journal.");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Resposta inválida do Journal.");
  return data.filter((post: Post) => post.published !== false);
}
export async function readPost(id: string): Promise<Post> {
  const response = await fetch(`/api/blog/${encodeURIComponent(id)}`);
  if (!response.ok)
    throw Object.assign(new Error("Não foi possível carregar o artigo."), {
      status: response.status,
    });
  return response.json();
}
