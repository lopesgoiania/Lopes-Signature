import { useEffect, useState, type FormEvent } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowUpRight, Bath, BedDouble, Building2, Car, CheckCircle2, Download, ExternalLink, MapPin, MessageSquare, Phone, Ruler, Send, ShieldCheck, Sparkles, Waves } from 'lucide-react';
import { useGetProperty, useCreateLead } from '@workspace/api-client-react';
import { PageLogo, PublicNav, SectionLabel, money } from '@/components/signature-ui';
import { RaioXModal } from '@/components/raio-x-modal';

export default function LandingPage() {
  const [, params] = useRoute('/lp/:id');
  const id = params?.id || 'bauhaus-vaca-brava';
  const { data: property, isLoading } = useGetProperty(id);
  const createLead = useCreateLead();

  const [showRaioX, setShowRaioX] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'lp_view', pageUrl: `/lp/${id}`, propertyId: id }),
    }).catch(() => {});
  }, [id]);

  if (isLoading) {
    return (
      <div className="signature-shell noise min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="skeleton h-12 w-48 mx-auto rounded-xl" />
          <p className="text-sm text-[#9a9a9a]">Carregando Landing Page do produto...</p>
        </div>
      </div>
    );
  }

  const p = property || {
    id: 'bauhaus-vaca-brava',
    title: 'Bauhaus',
    builder: 'Sousa Andrade',
    location: 'Goiânia, GO',
    neighborhood: 'T 3, Setor Bueno',
    address: 'Avenida T-3, Setor Bueno, em frente ao Parque Vaca Brava',
    category: 'Apartamentos',
    price: 8136691,
    area: 398,
    bedrooms: 4,
    suites: 4,
    parking: 4,
    description: 'O Bauhaus oferece apartamentos de altíssimo padrão na orla do Parque Vaca Brava com vista 180° definitiva.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    badges: ['EXCLUSIVO', 'FRENTE AO PARQUE'],
    featured: true,
    lpUrl: '/lp/bauhaus-vaca-brava',
    status: 'Disponível',
  };

  function handleLeadSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createLead.mutate({
      data: {
        name: String(form.get('name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        propertyId: p.id,
        propertyTitle: `Landing Page: ${p.title}`,
        status: 'new',
        source: 'landing-page',
        note: `Interesse cadastrado na LP oficial do ${p.title}`,
      },
    });
    setSubmitted(true);
    e.currentTarget.reset();
  }

  return (
    <div className="signature-shell noise min-h-[100dvh] text-[#f5f2e9]">
      <PublicNav />

      {/* Hero Comercial da LP */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden pt-28 pb-16 px-5 md:px-10">
        <img
          src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'}
          alt={p.title}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="hero-vignette absolute inset-0 pointer-events-none" />

        <div className="relative mx-auto w-full max-w-[1280px]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs text-[#e8c766]">
              <Sparkles size={14} /> Empreendimento Exclusivo — {(p as any).builder || 'Lopes Signature'}
            </div>

            <h1 className="serif text-5xl md:text-7xl leading-[.95] text-white">
              {p.title} <br />
              <em className="font-normal text-[#e8c766]">{p.neighborhood}</em>
            </h1>

            <p className="text-base md:text-lg text-[#c9c9c9] max-w-xl leading-7">
              {p.description.slice(0, 180)}...
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setShowRaioX(true)}
                className="metal-button flex items-center gap-2 rounded-full px-7 py-4 text-xs font-bold"
              >
                Ver Raio-X Técnico <ArrowUpRight size={16} />
              </button>
              <a
                href="#agendar"
                className="flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-xs text-white hover:border-[#d4af37] hover:text-[#e8c766]"
              >
                Falar com Consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ficha Técnica Rápida */}
      <section className="border-y border-white/10 bg-[#121214] py-8 px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="mono-label text-xs text-[#d4af37]">Valor a partir de</p>
            <p className="serif text-2xl md:text-3xl text-white mt-1">{money(p.price)}</p>
          </div>
          <div>
            <p className="mono-label text-xs text-[#d4af37]">Metragem</p>
            <p className="serif text-2xl md:text-3xl text-white mt-1">{p.area}m² Privativos</p>
          </div>
          <div>
            <p className="mono-label text-xs text-[#d4af37]">Configuração</p>
            <p className="serif text-2xl md:text-3xl text-white mt-1">{p.bedrooms} Suítes Plenas</p>
          </div>
          <div>
            <p className="mono-label text-xs text-[#d4af37]">Vagas</p>
            <p className="serif text-2xl md:text-3xl text-white mt-1">{p.parking} Vagas de Garagem</p>
          </div>
        </div>
      </section>

      {/* Destaques e Atributos */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <SectionLabel>Conceito & Arquitetura</SectionLabel>
            <h2 className="serif text-4xl text-white md:text-5xl leading-[.98]">
              Uma experiência residencial <em className="font-normal text-[#d4af37]">sem precedentes.</em>
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#c9c9c9]">
              {p.description}
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowRaioX(true)}
                className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs text-white hover:border-[#d4af37] hover:text-[#e8c766]"
              >
                Abrir Galeria & Plantas (Raio-X)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {p.images?.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${p.title} ${i + 1}`}
                className="aspect-[4/3] w-full rounded-2xl object-cover border border-white/10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Agendamento Comercial */}
      <section id="agendar" className="mx-auto max-w-[1280px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="rounded-3xl border border-[#d4af37]/40 bg-[#161618] p-8 md:p-14 grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
          <div>
            <SectionLabel>Agende seu Atendimento VIP</SectionLabel>
            <h2 className="serif text-4xl text-white md:text-5xl">
              Receba a apresentação privada do <em className="font-normal text-[#e8c766]">{p.title}</em>
            </h2>
            <p className="mt-4 text-sm text-[#9a9a9a]">
              Preencha para receber o book em PDF, tabela de valores atualizada e agendar uma reunião exclusiva.
            </p>
          </div>

          <div>
            {submitted ? (
              <div className="rounded-2xl border border-[#00a884] bg-[#00a884]/10 p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto text-[#00a884]" />
                <h3 className="serif text-2xl text-white mt-4">Cadastro Concluído</h3>
                <p className="text-xs text-[#c9c9c9] mt-2">
                  Nosso consultor entrará em contato em instantes com todo o material.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input
                  name="name"
                  required
                  placeholder="Seu nome completo"
                  className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                />
                <input
                  name="phone"
                  required
                  placeholder="Seu WhatsApp (11) 99999-9999"
                  className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                />
                <button
                  type="submit"
                  disabled={createLead.isPending}
                  className="metal-button w-full rounded-xl py-4 text-xs font-bold"
                >
                  {createLead.isPending ? 'Cadastrando...' : 'Receber Material Exclusivo'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Modal de Raio-X */}
      {showRaioX && <RaioXModal property={p as any} onClose={() => setShowRaioX(false)} />}
    </div>
  );
}
