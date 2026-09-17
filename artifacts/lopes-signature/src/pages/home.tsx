import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Instagram, Linkedin, Mail, MapPin, Play, Waves } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateLead, useListProperties, useListSpecialists, type Property } from '@workspace/api-client-react';
import { EmptyState, ErrorState, PageLogo, PropertyCard, PublicNav, SearchBar, SectionLabel, SkeletonGrid, SpecialistAvatar, imageFor, money, propertyImages } from '@/components/signature-ui';
import { RaioXModal } from '@/components/raio-x-modal';

const categories = [
  { label: 'Casas', icon: Building2 }, { label: 'Apartamentos', icon: Building2 }, { label: 'Coberturas', icon: Waves }, { label: 'Fazendas', icon: MapPin },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem('lopes-saved') || '[]'));
  const [selectedRaioXProperty, setSelectedRaioXProperty] = useState<Property | null>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);

  const propertyQuery = useListProperties(search ? { search } : undefined);
  const createLead = useCreateLead();
  const properties = propertyQuery.data || [];

  // Buscar posts dinâmicos da API /api/blog e registrar visita real
  useEffect(() => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'page_view', pageUrl: '/' }),
    }).catch(() => {});

    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoadingBlog(false));
  }, []);

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next); localStorage.setItem('lopes-saved', JSON.stringify(next));
  }

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createLead.mutate({ data: { name: String(form.get('name') || 'Interesse Signature'), email: String(form.get('email') || ''), phone: '', propertyId: '', propertyTitle: 'Newsletter Lopes Signature', status: 'new', source: 'newsletter', note: 'Inscrição na curadoria Lopes Signature.' } });
    event.currentTarget.reset();
  }

  return <div className="signature-shell noise min-h-[100dvh] text-[#f5f2e9]">
    <PublicNav />
    <main>
      <section className="relative flex min-h-[550px] md:min-h-[680px] lg:min-h-[760px] items-end overflow-hidden border-b border-white/10 px-5 pb-12 pt-28 md:px-10 md:pb-16 bg-[#090909]">
        <img src="/images/banner-hero-3.png" alt="Lopes Signature Banner Hero" className="absolute inset-0 h-full w-full object-cover object-center opacity-100" />
        <div className="hero-vignette absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto flex w-full max-w-[1280px] items-end justify-between">
          <div className="max-w-2xl reveal rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-md">
            <p className="mono-label mb-3 text-[#e8c766]">Imóveis para uma vida extraordinária</p>
            <h1 className="serif text-4xl leading-[.95] tracking-[-.03em] text-white md:text-6xl">A casa certa<br /><em className="font-normal text-[#e8c766]">não é encontrada.</em></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#c9c9c9]">É reconhecida. Uma seleção privada de endereços com arquitetura, história e espaço para o que realmente importa.</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href="#catalogo" className="metal-button flex items-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold" data-testid="link-hero-explorar">Explorar seleção <ArrowUpRight size={15} /></a><a href="#manifesto" className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-xs text-white hover:border-[#d4af37] hover:text-[#e8c766]" data-testid="link-hero-manifesto"><Play size={14} /> Nosso olhar</a></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-[1180px] px-5 md:px-10" id="catalogo">
        <SearchBar onSearch={setSearch} initial={search} />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => setSearch(label === 'Casas' ? 'casa' : label.slice(0, -1))} className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#121212] px-4 py-3 text-xs text-[#c9c9c9] hover:border-[#d4af37]/60 hover:text-[#e8c766]" data-testid={`button-category-${label.toLowerCase()}`}><Icon size={15} className="text-[#d4af37]" />{label}</button>)}</div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-10 flex items-end justify-between"><div><SectionLabel>Seleção Signature</SectionLabel><h2 className="serif text-4xl text-white md:text-5xl">Endereços com <em className="font-normal text-[#d4af37]">alma.</em></h2></div><span className="hidden text-right text-xs leading-5 text-[#7a7a7a] md:block">Uma curadoria que privilegia<br />o extraordinário sobre o óbvio.</span></div>
        {propertyQuery.isLoading ? <SkeletonGrid /> : propertyQuery.isError ? <ErrorState onRetry={() => propertyQuery.refetch()} /> : properties.length === 0 ? <EmptyState title="Nenhum empreendimento cadastrado no momento" description="Cadastre novos produtos no Painel de Gestão para exibi-los no catálogo com Raio-X e Landing Page." onReset={() => setSearch('')} /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} saved={saved.includes(property.id)} onSave={() => toggleSave(property.id)} onOpenRaioX={(prop) => setSelectedRaioXProperty(prop)} />)}</div>}
      </section>

      <section id="manifesto" className="border-y border-[#d4af37]/20 bg-[#121212]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-24 md:grid-cols-[.9fr_1.1fr] md:px-10 md:py-32">
          <div><SectionLabel>O nosso olhar</SectionLabel><h2 className="serif text-5xl leading-[.95] text-white md:text-6xl">Menos imóveis.<br /><em className="font-normal text-[#e8c766]">Mais significado.</em></h2></div>
          <div className="max-w-xl"><p className="text-lg leading-8 text-[#c9c9c9]">Não acreditamos em listas intermináveis. Acreditamos em contexto: a luz que atravessa uma sala às quatro da tarde, a proporção certa entre casa e jardim, o bairro que combina com seu próximo capítulo.</p><p className="mt-6 text-sm leading-7 text-[#7a7a7a]">Cada endereço é visitado, entendido e apresentado por uma equipe que trata sua busca como uma conversa — não como uma transação.</p><Link href="/especialistas" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#e8c766]" data-testid="link-manifesto-especialistas">Conheça nossa equipe de especialistas <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      {/* Seção de Blog & Notícias da Lopes Signature (Alimentada Dinamicamente pelo Agente de IA) */}
      <section id="blog" className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <SectionLabel>Notícias & Tendências</SectionLabel>
            <h2 className="serif text-4xl text-white md:text-5xl">
              Perspectivas do <em className="font-normal text-[#d4af37]">Mercado de Luxo.</em>
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-5 text-[#7a7a7a]">
            Artigos pesquisados e gerados via Inteligência Artificial sobre o mercado imobiliário.
          </p>
        </div>

        {loadingBlog ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-80 rounded-3xl" />
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d4af37]/30 bg-[#121212] p-12 text-center">
            <p className="text-[#9a9a9a]">Nenhum artigo publicado no momento. Acesse o Painel de Gestão para gerar artigos com IA.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#121212] transition duration-300 hover:border-[#d4af37]/50 hover:bg-[#161616]">
                <div className="overflow-hidden">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                    alt={post.title}
                    className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-[#7a7a7a]">
                    <span className="mono-label text-[#d4af37]">{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="serif mt-3 text-2xl leading-7 text-white group-hover:text-[#e8c766]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#9a9a9a] line-clamp-3">
                    {post.summary}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#e8c766]">
                    <span>Ler artigo</span>
                    <span className="text-[10px] text-[#7a7a7a] font-mono">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="contato" className="mx-auto max-w-[1280px] px-5 pb-24 md:px-10 md:pb-32"><div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/40 bg-[#1a1a1a] p-8 md:p-14"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#d4af37]/20" /><div className="relative grid gap-10 md:grid-cols-[1fr_1fr] md:items-center"><div><SectionLabel>Receba a curadoria</SectionLabel><h2 className="serif text-4xl text-white md:text-5xl">Alguns endereços<br /><em className="font-normal text-[#e8c766]">merecem ser vistos primeiro.</em></h2></div><form onSubmit={submitNewsletter} className="flex flex-col gap-3" data-testid="form-newsletter"><input name="name" required placeholder="Seu nome" className="h-12 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#d4af37]" data-testid="input-newsletter-name" /><div className="flex gap-2"><input name="email" type="email" required placeholder="seu@email.com" className="h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#d4af37]" data-testid="input-newsletter-email" /><button type="submit" className="metal-button rounded-xl px-5 text-xs font-bold" data-testid="button-newsletter-submit">{createLead.isPending ? 'Enviando' : 'Entrar na lista'}</button></div>{createLead.isSuccess && <p className="text-xs text-[#7acb8e]" data-testid="status-newsletter-success">Sua curadoria começa agora.</p>}</form></div></div></section>
    </main>

    {/* Modal do Raio-X */}
    {selectedRaioXProperty && (
      <RaioXModal
        property={selectedRaioXProperty}
        onClose={() => setSelectedRaioXProperty(null)}
      />
    )}

    <footer className="border-t border-white/10 bg-[#0d0d0d]"><div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-10"><div><PageLogo /><p className="mt-5 max-w-xs text-sm leading-6 text-[#7a7a7a]">Uma nova forma de encontrar lugares à altura da sua história.</p><div className="mt-6 flex gap-2"><a href="https://instagram.com" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#d4af37]" data-testid="link-instagram"><Instagram size={16} /></a><a href="https://linkedin.com" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#d4af37]" data-testid="link-linkedin"><Linkedin size={16} /></a><a href="mailto:curadoria@lopessignature.com.br" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#d4af37]" data-testid="link-email"><Mail size={16} /></a></div></div><div><p className="mono-label mb-5 text-[#d4af37]">Navegue</p><div className="flex flex-col gap-3 text-sm text-[#9a9a9a]"><a href="/#catalogo" data-testid="link-footer-imoveis">Imóveis</a><Link href="/especialistas" data-testid="link-footer-especialistas">Especialistas</Link><a href="/#blog" data-testid="link-footer-blog">Notícias</a><Link href="/contato" data-testid="link-footer-contato">Contato</Link></div></div><div><p className="mono-label mb-5 text-[#d4af37]">Contato</p><p className="text-sm text-[#9a9a9a]">+55 11 3081 4800<br />curadoria@lopessignature.com.br<br />São Paulo · Goiânia · Brasil</p></div></div><div className="border-t border-white/10 px-5 py-5 md:px-10"><div className="mx-auto flex max-w-[1280px] justify-between text-[10px] uppercase tracking-[.15em] text-[#5c5c5c]"><span>© 2026 Lopes Signature</span><span>Privacidade · Termos</span></div></div></footer>
  </div>;
}