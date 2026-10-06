import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { PublicNav, SectionLabel } from '@/components/signature-ui';
import type { ReactNode } from 'react';

type Post = { id: string; title: string; category: string; summary: string; content: string; image?: string; date?: string; readTime?: string; author?: string; published?: boolean };
async function readPosts(): Promise<Post[]> {
  const response = await fetch('/api/blog');
  if (!response.ok) throw new Error('Não foi possível carregar o Journal.');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Não foi possível carregar o Journal.');
  return data.filter((post: Post) => post.published !== false);
}
function ArticleBody({ content }: { content: string }) {
  if (!/<\/?[a-z][\s\S]*>/i.test(content)) return <>{content.split(/\n\s*\n/).map((text,i) => text.startsWith('#') ? <h2 key={i} className="serif mt-10 text-3xl text-foreground">{text.replace(/^#+\s*/, '')}</h2> : <p key={i} className="my-6 whitespace-pre-line">{text}</p>)}</>;
  const document = new DOMParser().parseFromString(content, 'text/html');
  function render(node: ChildNode, key: number): ReactNode {
    if (node.nodeType === 3) return node.textContent;
    if (!(node instanceof Element) || ['SCRIPT','STYLE','IFRAME','OBJECT'].includes(node.tagName)) return null;
    const children = Array.from(node.childNodes).map(render);
    switch (node.tagName) {
      case 'H1': case 'H2': case 'H3': return <h2 key={key} className="serif mt-10 text-3xl text-foreground">{children}</h2>;
      case 'P': return <p key={key} className="my-6">{children}</p>;
      case 'UL': return <ul key={key} className="my-6 list-disc pl-6">{children}</ul>;
      case 'OL': return <ol key={key} className="my-6 list-decimal pl-6">{children}</ol>;
      case 'LI': return <li key={key}>{children}</li>;
      case 'STRONG': case 'B': return <strong key={key}>{children}</strong>;
      case 'EM': case 'I': return <em key={key}>{children}</em>;
      case 'BR': return <br key={key} />;
      default: return <span key={key}>{children}</span>;
    }
  }
  return <>{Array.from(document.body.childNodes).map(render)}</>;
}
export default function JournalPage() {
  const { id } = useParams<{ id?: string }>();
  const query = useQuery({ queryKey: ['journal-posts'], queryFn: readPosts });
  const post = query.data?.find(item => item.id === id);
  return <div className="signature-shell noise min-h-[100dvh] text-foreground"><PublicNav /><main className="mx-auto max-w-[1280px] px-5 pb-24 pt-40 md:px-10">
    <SectionLabel>Journal Signature</SectionLabel>
    {query.isLoading ? <p role="status" className="py-12">Carregando leituras…</p> : query.isError ? <div className="py-12"><p>Não foi possível carregar os artigos.</p><button className="mt-5 text-[#876526]" onClick={() => query.refetch()}>Tentar novamente</button></div> : id ? post ? <article className="mx-auto max-w-3xl"><Link href="/journal" className="text-sm text-[#876526]">← Todos os artigos</Link><h1 className="serif mt-8 text-4xl leading-tight md:text-6xl">{post.title}</h1><p className="mt-5 text-xs text-[#59564e]">{[post.category,post.date,post.readTime].filter(Boolean).join(' · ')}</p><p className="mt-8 text-xl leading-8 text-[#59564e]">{post.summary}</p>{post.image && <img src={post.image} alt={post.title} className="mt-10 aspect-video w-full rounded-2xl object-cover" />}<div className="mt-10 text-base leading-8 text-[#59564e]"><ArticleBody content={post.content || ''} /></div></article> : <div className="py-12"><h1 className="serif text-4xl">Artigo não encontrado.</h1><Link href="/journal" className="mt-6 inline-block text-[#876526]">Voltar ao Journal</Link></div> : <><h1 className="serif text-4xl md:text-6xl">Um olhar estendido sobre<br /><em className="font-normal text-[#876526]">o mercado de luxo.</em></h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#59564e]">Arquitetura, endereços e movimentos do mercado de Goiânia, sob a perspectiva de quem conhece o alto luxo.</p><div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{query.data?.map(item => <Link key={item.id} href={`/journal/${encodeURIComponent(item.id)}`} className="overflow-hidden rounded-3xl border border-border bg-card hover:border-[#d4af37]/50">{item.image && <img src={item.image} alt={item.title} className="aspect-video w-full object-cover" />}<div className="p-6"><SectionLabel>{item.category}</SectionLabel><h2 className="serif text-3xl">{item.title}</h2><p className="mt-4 text-sm leading-6 text-[#59564e]">{item.summary}</p><p className="mt-6 text-xs text-[#876526]">Ler artigo →</p></div></Link>)}</div>{!query.data?.length && <p className="mt-8 rounded-2xl border border-border p-8 text-[#59564e]">Em breve, novas leituras do Journal Signature.</p>}</>}
  </main></div>;
}