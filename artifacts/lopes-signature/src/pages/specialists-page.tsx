import { useState } from 'react';
import { ArrowRight, Award, Building2, CheckCircle2, Globe, Mail, MapPin, Phone, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useListSpecialists, type Specialist } from '@workspace/api-client-react';
import { PageLogo, PublicNav, SectionLabel } from '@/components/signature-ui';

const defaultSpecialists: Specialist[] = [
  {
    id: 'marina-lopes',
    name: 'Marina Lopes',
    role: 'Diretora de Curadoria & Private Client',
    credential: 'CRECI 188.420-F · 15 anos',
    bio: 'Especialista em patrimônios residenciais de altíssimo padrão, com consultoria personalizada para famílias e investidores globais.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    whatsapp: '5511999991111',
    listings: 24,
  },
  {
    id: 'rafael-amaral',
    name: 'Rafael Amaral',
    role: 'Head de Empreendimentos Autorais - Goiânia & SP',
    credential: 'CRECI 204.118-F · 12 anos',
    bio: 'Foco exclusivo em residências suspensas, coberturas e arquitetura de prestígio (Opus, Cyrela, JFA).',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    whatsapp: '5562999992222',
    listings: 18,
  },
  {
    id: 'camila-prado',
    name: 'Camila Prado',
    role: 'Private Client Advisor - Coberturas & Penthouses',
    credential: 'CRECI 176.904-F · 10 anos',
    bio: 'Atendimento estritamente confidencial para negociações off-market e propriedades ícones do mercado imobiliário.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    whatsapp: '5511977773333',
    listings: 15,
  },
  {
    id: 'carlos-almeida',
    name: 'Carlos Almeida',
    role: 'Consultor Sênior de Investimentos Imobiliários',
    credential: 'CRECI 195.302-F · 14 anos',
    bio: 'Especializado na estruturação de carteiras imobiliárias de alto rendimento e preservação de capital familiar.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    whatsapp: '5562988884444',
    listings: 16,
  },
];

export default function SpecialistsPage() {
  const { data: specialistsFromQuery } = useListSpecialists();
  const specialists = specialistsFromQuery && specialistsFromQuery.length > 0 ? specialistsFromQuery : defaultSpecialists;
  const [selectedRole, setSelectedRole] = useState<string>('todos');

  const filteredSpecialists = selectedRole === 'todos' 
    ? specialists 
    : specialists.filter(s => s.role.toLowerCase().includes(selectedRole));

  return (
    <div className="signature-shell noise min-h-[100dvh] text-[#f5f2e9]">
      <PublicNav />

      <main className="pt-28 md:pt-36">
        {/* Banner de Topo / Hero da Página */}
        <section className="relative border-b border-white/10 px-5 pb-16 pt-10 md:px-10 md:pb-24">
          <div className="mx-auto max-w-[1280px]">
            <SectionLabel>Sobre Nós & Nosso Time</SectionLabel>
            <h1 className="serif text-5xl leading-[.95] text-white md:text-7xl">
              Relações construídas sobre <br />
              <em className="font-normal text-[#e8c766]">confiança, discrição e visão.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#c9c9c9]">
              Conheça a equipe de especialistas da <strong>Lopes Signature</strong>. Profissionais com anos de repertório no mercado imobiliário de altíssimo padrão, preparados para conduzir a sua jornada de compra ou venda com excelência absoluta.
            </p>
          </div>
        </section>

        {/* Estatísticas e Diferenciais */}
        <section className="border-b border-white/10 bg-[#121212] py-12 px-5 md:px-10">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">+R$ 2.4B</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#9a9a9a]">Em imóveis geridos</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">100%</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#9a9a9a]">Atendimento exclusivo</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">15+ Anos</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#9a9a9a]">Liderança em Alto Padrão</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">Off-Market</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#9a9a9a]">Oportunidades privadas</p>
            </div>
          </div>
        </section>

        {/* Lista de Especialistas */}
        <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28" id="time">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel>O Time Signature</SectionLabel>
              <h2 className="serif text-4xl text-white md:text-5xl">
                Especialistas em <em className="font-normal text-[#d4af37]">imóveis únicos.</em>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['todos', 'curadoria', 'goiânia', 'coberturas'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedRole(filter)}
                  className={`rounded-full border px-4 py-2 text-xs capitalize transition ${
                    selectedRole === filter
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#e8c766]'
                      : 'border-white/10 text-[#9a9a9a] hover:border-white/30 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialists.map((person) => (
              <article
                key={person.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 transition duration-300 hover:border-[#d4af37]/50 hover:bg-[#161616]"
              >
                <div className="mb-6 overflow-hidden rounded-2xl">
                  <img
                    src={person.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                    alt={person.name}
                    className="aspect-[4/3] w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <p className="mono-label text-xs text-[#d4af37]">{person.role}</p>
                <h3 className="serif mt-2 text-3xl text-white">{person.name}</h3>
                <p className="mt-2 text-xs text-[#7a7a7a]">
                  {person.credential} · {person.listings || 15} portfólios ativos
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#9a9a9a]">{person.bio}</p>

                <div className="mt-8 flex gap-3 border-t border-white/10 pt-5">
                  <a
                    href={`https://wa.me/${person.whatsapp || '5511999991111'}?text=Olá%20${encodeURIComponent(person.name)},%20gostaria%20de%20falar%20sobre%20os%20imóveis%20Lopes%20Signature.`}
                    target="_blank"
                    rel="noreferrer"
                    className="metal-button flex-1 rounded-xl py-3 text-center text-xs font-bold"
                  >
                    Falar via WhatsApp
                  </a>
                  <Link
                    href="/contato"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                    title="Agendar reunião"
                  >
                    <Mail size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Seção de Compromisso Signature */}
        <section className="border-t border-white/10 bg-[#0d0d0d] py-20 px-5 md:px-10">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <ShieldCheck size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Privacidade e Sigilo</h4>
                <p className="mt-3 text-sm leading-6 text-[#9a9a9a]">
                  Tratamos cada atendimento com estrita confidencialidade, garantindo a proteção da sua privacidade em todas as etapas da negociação.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <Award size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Curadoria Autoral</h4>
                <p className="mt-3 text-sm leading-6 text-[#9a9a9a]">
                  Apenas imóveis que atendem a critérios rigorosos de arquitetura, localização e potencial de valorização entram no nosso portfólio.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <UserCheck size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Consultoria Jurídica & Financeira</h4>
                <p className="mt-3 text-sm leading-6 text-[#9a9a9a]">
                  Suporte completo com especialistas em direito imobiliário, estruturação tributária e avaliação patrimonial.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#070707]">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
          <div>
            <PageLogo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#7a7a7a]">
              Uma nova forma de encontrar lugares à altura da sua história.
            </p>
          </div>
          <div>
            <p className="mono-label mb-5 text-[#d4af37]">Navegue</p>
            <div className="flex flex-col gap-3 text-sm text-[#9a9a9a]">
              <Link href="/">Início</Link>
              <a href="/#catalogo">Imóveis</a>
              <Link href="/especialistas" className="text-[#e8c766]">Especialistas</Link>
              <a href="/#blog">Notícias</a>
              <Link href="/contato">Contato</Link>
            </div>
          </div>
          <div>
            <p className="mono-label mb-5 text-[#d4af37]">Contato</p>
            <p className="text-sm text-[#9a9a9a]">
              +55 11 3081 4800<br />
              curadoria@lopessignature.com.br<br />
              São Paulo · Goiânia · Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
