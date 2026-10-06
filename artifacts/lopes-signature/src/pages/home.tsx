import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Instagram, Linkedin, Mail, MapPin, Play, Waves } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateLead, useListProperties, useListSpecialists, type Property } from '@workspace/api-client-react';
import { EmptyState, ErrorState, PageLogo, PropertyCard, PublicNav, SearchBar, SectionLabel, SkeletonGrid, SpecialistAvatar, imageFor, money, propertyImages } from '@/components/signature-ui';
import { RaioXModal } from '@/components/raio-x-modal';
import { ScrollVideoHero } from '@/components/scroll-video-hero';

const categories = [
  { label: 'Casas', icon: Building2 }, { label: 'Apartamentos', icon: Building2 }, { label: 'Coberturas', icon: Waves }, { label: 'Fazendas', icon: MapPin },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('lopes-saved') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedRaioXProperty, setSelectedRaioXProperty] = useState<Property | null>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(true);

  const propertyQuery = useListProperties(search ? { search } : undefined);
  const createLead = useCreateLead();
  const properties = Array.isArray(propertyQuery.data) ? propertyQuery.data : [];

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
        if (Array.isArray(data)) setBlogPosts(data.filter(post => post.published !== false));
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
    if (createLead.isPending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    createLead.mutate({ data: { name: String(form.get('name') || 'Interesse Signature'), email: String(form.get('email') || ''), phone: '', propertyId: '', propertyTitle: 'Newsletter Lopes Signature', status: 'new', source: 'newsletter', note: 'Inscrição no Journal Signature.' } }, { onSuccess: () => formElement.reset() });
  }

  return <div className="signature-shell noise min-h-[100dvh] text-foreground">
    <PublicNav />
    <main>
      <ScrollVideoHero />

      <section className="relative z-10 mx-auto -mt-8 max-w-[1180px] px-5 md:px-10" id="catalogo">
        <SearchBar onSearch={setSearch} initial={search} />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => setSearch(label === 'Casas' ? 'casa' : label.slice(0, -1))} className="flex shrink-0 items-center gap-2 rounded-full border bg-card px-4 py-3 text-xs text-muted-foreground hover:border-[#d4af37]/60 hover:text-[#d4af37]" data-testid={`button-category-${label.toLowerCase()}`}><Icon size={15} className="text-[#d4af37]" />{label}</button>)}</div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel>SELEÇÃO SIGNATURE</SectionLabel>
            <h2 className="serif text-3xl text-foreground md:text-5xl mt-2 mb-4">Imóveis de alto padrão em destaque</h2>
            <p className="text-sm leading-6 text-muted-foreground">Endereços com alma, arquitetura e espaço para viver bem. Conheça uma seleção de casas e apartamentos em Goiânia e encontre o que combina com você.</p>
          </div>
          <Link href="/imoveis" className="shrink-0 text-sm font-semibold text-primary hover:underline">Ver catálogo de imóveis</Link>
        </div>
        {propertyQuery.isLoading ? <SkeletonGrid /> : propertyQuery.isError ? <ErrorState onRetry={() => propertyQuery.refetch()} /> : properties.length === 0 ? <EmptyState title="Nenhum empreendimento cadastrado no momento" description="" onReset={() => setSearch('')} /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} saved={saved.includes(property.id)} onSave={() => toggleSave(property.id)} onOpenRaioX={(prop) => setSelectedRaioXProperty(prop)} />)}</div>}
      </section>

      {/* Categorias Editoriais */}
      <section className="mx-auto max-w-[1280px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="mb-12 max-w-3xl">
          <h2 className="serif text-3xl text-foreground md:text-4xl">Encontre seu imóvel de alto padrão em Goiânia</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Da privacidade de uma casa à praticidade de um apartamento, diferentes formas de morar pedem escolhas diferentes. Explore o catálogo pelo tipo de imóvel que faz sentido para sua rotina.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Casas de alto padrão em Goiânia', desc: 'Explore casas com diferentes propostas de arquitetura, áreas de convivência e espaços ao ar livre. Compare as características de cada endereço e encontre opções compatíveis com o seu estilo de vida.', link: 'Ver casas de alto padrão', href: '/casas-alto-padrao-goiania' },
            { title: 'Apartamentos de luxo em Goiânia', desc: 'Conheça apartamentos que combinam localização, distribuição dos ambientes e comodidades para o dia a dia. Consulte plantas, metragens e diferenciais dos empreendimentos disponíveis.', link: 'Ver apartamentos de luxo', href: '/apartamentos-luxo-goiania' },
            { title: 'Coberturas em Goiânia', desc: 'Para quem busca amplitude e uma relação diferente com a cidade, explore coberturas e confira as particularidades de cada unidade, das áreas externas à configuração dos ambientes.', link: 'Conhecer coberturas', href: '/coberturas-goiania' },
            { title: 'Empreendimentos de alto padrão em Goiânia', desc: 'Descubra projetos residenciais e compare arquitetura, localização, plantas e estágio de construção. Nossa equipe ajuda você a entender as opções disponíveis e os detalhes de cada empreendimento.', link: 'Explorar empreendimentos', href: '/empreendimentos' }
          ].map((cat) => (
            <div key={cat.title} className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6">
              <div>
                <h3 className="serif text-xl text-foreground mb-3">{cat.title}</h3>
                <p className="text-xs leading-5 text-muted-foreground mb-6">{cat.desc}</p>
              </div>
              <Link href={cat.href} className="text-xs font-bold text-primary hover:underline">{cat.link}</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="manifesto" className="bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-24 md:grid-cols-[1fr_1fr] md:px-10 md:py-32 items-center">
          <div>
            <p className="mono-label mb-4 text-primary">O OLHAR SIGNATURE. A EXPERIÊNCIA LOPES.</p>
            <h2 className="serif text-4xl leading-[1.1] md:text-5xl mb-6">Mais possibilidades.<br />Uma escolha com significado.</h2>
            <Link href="/especialistas" className="metal-button inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold mt-2">
              Conheça os especialistas Signature
            </Link>
          </div>
          <div>
            <p className="text-lg leading-8 mb-6 text-[#D0D0D0]">
              Um catálogo amplo ganha valor quando você encontra o que realmente faz sentido para sua vida. A Lopes Signature conecta imóveis de alto padrão em Goiânia a uma busca orientada pelo seu perfil, pelas suas prioridades e pela forma como você deseja morar.
            </p>
            <p className="text-sm leading-6 text-[#D0D0D0] mb-8">
              Nossa equipe ajuda a comparar localizações, plantas e diferenciais para transformar possibilidades em uma seleção mais precisa.
            </p>
            <ul className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-primary">
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Especialistas em alto padrão</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Atendimento personalizado</li>
              <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Experiência Lopes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Seção de Blog & Notícias da Lopes Signature (Alimentada Dinamicamente pelo Agente de IA) */}
      <section id="blog" className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <SectionLabel>Journal Signature</SectionLabel>
            <h2 className="serif text-3xl text-foreground md:text-4xl">
              Um olhar estendido sobre o mercado de luxo.
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            Arquitetura, endereços e movimentos do mercado de Goiânia, sob a perspectiva de quem conhece o alto luxo.
          </p>
        </div>

        {loadingBlog ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-80 rounded-3xl" />
            ))}
          </div>
        ) : blogPosts.length === 0 ? <p className="text-muted-foreground">Em breve, novas leituras do Journal Signature.</p> : (
          <div className="grid gap-8 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <Link href={`/journal/${encodeURIComponent(post.id)}`} key={post.id} className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:border-primary/50 hover:bg-muted">
                <div className="overflow-hidden">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                    alt={post.title}
                    className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="mono-label text-primary">{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="serif mt-3 text-2xl leading-7 text-foreground group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground line-clamp-3">
                    {post.summary}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-primary">
                    <span>Ler artigo</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link href="/journal" className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#876526] hover:underline">Ver todos os artigos <ArrowRight size={15} /></Link>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[800px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="mb-10 text-center">
          <h2 className="serif text-3xl text-foreground md:text-4xl">Dúvidas sobre imóveis de alto padrão em Goiânia</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Como encontrar um imóvel de alto padrão em Goiânia?', a: 'Comece pelo tipo de imóvel, pela localização e pelos ambientes que fazem parte da sua rotina. No catálogo Signature, você pode consultar as opções disponíveis e conversar com a equipe para refinar sua busca.' },
            { q: 'Qual a diferença entre um imóvel de alto padrão e um imóvel de luxo?', a: 'Esses termos são usados de formas diferentes no mercado. Mais do que a classificação, vale analisar o projeto, a localização, os materiais, a privacidade e os serviços de cada imóvel. Nossos especialistas ajudam a comparar essas características.' },
            { q: 'Como solicitar uma visita?', a: 'Na página do imóvel, escolha “Falar com especialista” ou preencha o formulário e informe seu interesse. A equipe entrará em contato para alinhar os detalhes e confirmar a disponibilidade.' },
            { q: 'Como consultar valores e disponibilidade?', a: 'Consulte as informações da página do imóvel e confirme as condições com a equipe Signature. Valores, unidades e condições de negociação podem ser atualizados.' },
          ].map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-foreground">
                <h3 className="text-sm md:text-base">{faq.q}</h3>
                <span className="ml-4 transition group-open:rotate-180">+</span>
              </summary>
              <div className="px-6 pb-6 text-sm leading-6 text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-[1280px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-accent p-8 md:p-14">
          <div className="relative grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
            <div>
              <SectionLabel>Assine o Journal Signature</SectionLabel>
              <h2 className="serif text-3xl text-foreground md:text-4xl mt-2">Um olhar sobre o luxo. Uma leitura só sua.</h2>
              <p className="mt-4 text-sm text-foreground/80">Receba as leituras do Journal Signature sobre arquitetura, endereços e o mercado de Goiânia.</p>
            </div>
            <form onSubmit={submitNewsletter} className="flex flex-col gap-3" data-testid="form-newsletter">
              <input name="name" required placeholder="Seu nome" className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-newsletter-name" />
              <div className="flex flex-col gap-2 md:flex-row">
                <input name="email" type="email" required placeholder="seu@email.com" className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-newsletter-email" />
                <button type="submit" disabled={createLead.isPending} className="metal-button disabled:opacity-60 rounded-xl px-5 py-3 text-xs font-bold whitespace-nowrap" data-testid="button-newsletter-submit">{createLead.isPending ? 'Enviando...' : 'Quero receber'}</button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Ao se inscrever, você concorda com nossa Política de Privacidade.</p>
              {createLead.isError && <p role="alert" className="text-sm text-red-800">Não foi possível registrar sua inscrição. Tente novamente.</p>}
              {createLead.isSuccess && <p className="text-xs text-[#168b41] mt-2" data-testid="status-newsletter-success">Sua inscrição no Journal Signature foi recebida.</p>}
            </form>
          </div>
        </div>
      </section>
    </main>

    {/* Modal do Raio-X */}
    {selectedRaioXProperty && (
      <RaioXModal
        property={selectedRaioXProperty}
        onClose={() => setSelectedRaioXProperty(null)}
      />
    )}

    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1.5fr] md:px-10">
        <div>
          <PageLogo />
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#D0D0D0]">Casas, apartamentos e empreendimentos de alto padrão em Goiânia, com o olhar dos especialistas Lopes Signature.</p>
          <div className="mt-6 flex gap-2">
            <a href="https://instagram.com" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5" data-testid="link-instagram"><Instagram size={16} /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5" data-testid="link-linkedin"><Linkedin size={16} /></a>
            <a href="mailto:contato@lopessignature.com.br" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5" data-testid="link-email"><Mail size={16} /></a>
          </div>
        </div>
        <div>
          <p className="mono-label mb-5 text-primary">Navegue</p>
          <div className="flex flex-col gap-3 text-sm text-[#D0D0D0]">
            <a href="/imoveis" className="hover:text-primary">Imóveis</a>
            <Link href="/empreendimentos" className="hover:text-primary">Empreendimentos</Link>
            <Link href="/sobre" className="hover:text-primary">Sobre nós</Link>
            <Link href="/especialistas" className="hover:text-primary">Especialistas</Link>
            <a href="/journal" className="hover:text-primary">Journal</a>
            <Link href="/contato" className="hover:text-primary">Contato</Link>
          </div>
        </div>
        <div>
          <p className="mono-label mb-5 text-primary">Contato</p>
          <div className="text-sm text-[#D0D0D0] space-y-4">
            <p>
              <strong>Telefone:</strong> (62) 3921 9800<br />
              <strong>E-mail:</strong> contato@lopessignature.com.br
            </p>
            <div>
              <strong>Endereços:</strong>
              <ul className="mt-2 space-y-2 text-xs">
                <li><span className="text-[#F7F5F0]">Lopes Marista:</span> R. 146, 495 - Marista, Goiânia - GO, 74170-090</li>
                <li><span className="text-[#F7F5F0]">Lopes Bueno:</span> Avenida T-11 Qd. 117 Lt. 20 - Nº 503 - St. Bueno, Goiânia - GO, 74223-070</li>
                <li><span className="text-[#F7F5F0]">Lopes Jardim Goiás:</span> R. 14, Térreo C-9 Lotes 02/05-15 - Jardim Goiás, Goiânia - GO, 74810-180</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1280px] justify-between text-[10px] uppercase tracking-[.15em] text-[#595959]">
          <span>© 2026 Lopes Signature</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-primary">Privacidade</Link>
            <Link href="/termos" className="hover:text-primary">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  </div>;
}