import { useState } from 'react';
import { Award, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useListSpecialists, type Specialist } from '@workspace/api-client-react';
import { PageLogo, PublicNav } from '@/components/signature-ui';

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

  const roleFilters = Array.from(new Set(specialists.map(person => person.role.split(' - ').pop()?.trim()).filter((role): role is string => Boolean(role))));

  const filteredSpecialists = selectedRole === 'todos'
    ? specialists
    : specialists.filter(s => s.role.split(' - ').pop()?.trim() === selectedRole);

  return (
    <div className="signature-shell specialists-page min-h-[100dvh] text-foreground">
      <PublicNav />

      <main className="pt-28 md:pt-36">
        {/* Banner de Topo / Hero da Página */}
        <section className="relative border-b border-white/10 px-5 pb-16 pt-10 md:px-10 md:pb-24">
          <div className="mx-auto max-w-[1280px]">

            <h1 className="serif specialist-heading text-5xl leading-[1.08] text-foreground md:text-7xl">
              Relações construídas sobre <br />
              <em className="font-normal text-[#876526]">confiança, discrição e visão.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#59564e]">
              Conheça a equipe de especialistas da <strong>Lopes Signature</strong>. Profissionais com anos de repertório no mercado imobiliário de altíssimo padrão, preparados para conduzir a sua jornada de compra ou venda com excelência absoluta.
            </p>
          </div>
        </section>

        {/* Estatísticas e Diferenciais */}
        <section className="border-b border-white/10 bg-[#121212] py-12 px-5 md:px-10">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">+R$ 2.4B</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#bcb8af]">Em imóveis geridos</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">100%</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#bcb8af]">Atendimento exclusivo</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">15+ Anos</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#bcb8af]">Liderança em Alto Padrão</p>
            </div>
            <div>
              <p className="serif text-4xl text-[#e8c766] md:text-5xl">Off-Market</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#bcb8af]">Oportunidades privadas</p>
            </div>
          </div>
        </section>

        {/* Lista de Especialistas */}
        <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28" id="time">
          <div className="mb-10 flex flex-col justify-between gap-6">
            <div>

              <h2 className="serif text-4xl text-foreground md:text-5xl">
                Especialistas em <em className="font-normal text-[#876526]">imóveis únicos.</em>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['todos', ...roleFilters].map((filter) => (
                <button
                  key={filter === 'todos' ? 'Todos' : filter}
                  onClick={() => setSelectedRole(filter)}
                  aria-pressed={selectedRole === filter}
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
                    selectedRole === filter
                      ? 'border-[#202020] bg-[#202020] text-[#F7F5F0]'
                      : 'border-[#ccc5b8] text-[#59564e] hover:border-[#876526] hover:text-[#202020]'
                  }`}
                >
                  {filter === 'todos' ? 'Todos' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialists.map((person) => (
              <article
                key={person.id}
                className="specialist-card relative flex flex-col overflow-hidden rounded-xl bg-[#121212]"
              >
                <div className="specialist-portrait relative aspect-[4/5] w-full bg-[#191918]">
                  <img
                    src={person.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                    alt={`Retrato de ${person.name}`}
                    loading="lazy" decoding="async"
                    className="absolute inset-0 h-full w-full object-contain object-center p-4"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <p className="text-xs leading-5 tracking-wide text-[#d8bc7c]">{person.role}</p>
                <h3 className="serif mt-2 text-3xl text-white">{person.name}</h3>
                <p className="mt-2 text-xs text-[#bcb8af]">
                  {person.credential}{person.listings != null ? ` · ${person.listings} portfólios ativos` : ''}
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#bcb8af]">{person.bio}</p>

                <div className="mt-8 flex gap-3 border-t border-white/10 pt-5">
                  <a
                    href={`https://wa.me/${person.whatsapp || '5511999991111'}?text=Olá%20${encodeURIComponent(person.name)},%20gostaria%20de%20falar%20sobre%20os%20imóveis%20Lopes%20Signature.`}
                    target="_blank"
                    rel="noreferrer"
                    className="specialist-contact flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 py-3 text-center text-sm font-semibold"
                  >
                    Falar via WhatsApp
                  </a>
                  <Link
                    href="/contato"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                    title="Agendar reunião"
                    aria-label={`Agendar reunião com ${person.name}`}
                  >
                    <Mail size={18} />
                  </Link>
                </div>
                </div>
              </article>
            ))}
          </div>
          {filteredSpecialists.length === 0 && <p role="status" className="py-12 text-muted-foreground">Nenhum especialista encontrado neste filtro. Selecione Todos para ver a equipe.</p>}
        </section>

        {/* Seção de Compromisso Signature */}
        <section className="border-t border-white/10 bg-[#0d0d0d] py-20 px-5 md:px-10">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <ShieldCheck size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Privacidade e Sigilo</h4>
                <p className="mt-3 text-sm leading-6 text-[#bcb8af]">
                  Tratamos cada atendimento com estrita confidencialidade, garantindo a proteção da sua privacidade em todas as etapas da negociação.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <Award size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Curadoria Autoral</h4>
                <p className="mt-3 text-sm leading-6 text-[#bcb8af]">
                  Apenas imóveis que atendem a critérios rigorosos de arquitetura, localização e potencial de valorização entram no nosso portfólio.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
                <UserCheck size={32} className="text-[#d4af37]" />
                <h4 className="serif mt-5 text-2xl text-white">Consultoria Jurídica & Financeira</h4>
                <p className="mt-3 text-sm leading-6 text-[#bcb8af]">
                  Suporte completo com especialistas em direito imobiliário, estruturação tributária e avaliação patrimonial.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1.5fr] md:px-10">
          <div>
            <PageLogo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#D0D0D0]">Casas, apartamentos e empreendimentos de alto padrão em Goiânia, com o olhar dos especialistas Lopes Signature.</p>
          </div>
          <div>
            <p className="mono-label mb-5 text-primary">Navegue</p>
            <div className="flex flex-col gap-3 text-sm text-[#D0D0D0]">
              <Link href="/imoveis" className="hover:text-primary">Imóveis</Link>
              <Link href="/empreendimentos" className="hover:text-primary">Empreendimentos</Link>
              <Link href="/especialistas" className="text-primary hover:text-primary">Especialistas</Link>
              <Link href="/conteudos" className="hover:text-primary">Conteúdos</Link>
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
                  <li><span className="text-[#F7F5F0]">Lopes Marista:</span> R. 146, 495 - Marista, Goiânia - GO</li>
                  <li><span className="text-[#F7F5F0]">Lopes Bueno:</span> Avenida T-11 Qd. 117 Lt. 20 - Nº 503 - St. Bueno</li>
                  <li><span className="text-[#F7F5F0]">Lopes Jardim Goiás:</span> R. 14, Térreo C-9 Lotes 02/05-15 - Jardim Goiás</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
