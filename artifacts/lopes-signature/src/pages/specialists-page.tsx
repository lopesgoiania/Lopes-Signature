import { useState } from 'react';
import { ArrowRight, Award, Building2, CheckCircle2, Globe, Mail, MapPin, Phone, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useListSpecialists, type Specialist } from '@workspace/api-client-react';
import { PageLogo, PublicNav, SectionLabel } from '@/components/signature-ui';

export default function SpecialistsPage() {
  const { data: specialistsFromQuery } = useListSpecialists();
  const specialists = specialistsFromQuery || [];
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
            <SectionLabel>Especialistas Lopes Signature</SectionLabel>
            <h1 className="serif text-5xl leading-[.95] text-white md:text-7xl">
              Especialistas em <br />
              <em className="font-normal text-[#e8c766]">alto padrão.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#c9c9c9]">
              Conheça a equipe de especialistas da <strong>Lopes Signature</strong>. Conhecimento do mercado de Goiânia e atendimento próximo para orientar sua escolha.
            </p>
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
              {['todos', ...Array.from(new Set(specialists.map(person => person.role.toLowerCase())))].map((filter) => (
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

          {filteredSpecialists.length === 0 && <p className="py-8 text-[#9a9a9a]">Nossa equipe será apresentada aqui. <Link href="/contato" className="text-[#e8c766]">Fale com a Lopes Signature.</Link></p>}
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
                  {person.credential}
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#9a9a9a]">{person.bio}</p>

                <div className="mt-8 flex gap-3 border-t border-white/10 pt-5">
                  {person.whatsapp && <a
                    href={`https://wa.me/${person.whatsapp || ''}?text=Olá%20${encodeURIComponent(person.name)},%20gostaria%20de%20falar%20sobre%20os%20imóveis%20Lopes%20Signature.`}
                    target="_blank"
                    rel="noreferrer"
                    className="metal-button flex-1 rounded-xl py-3 text-center text-xs font-bold"
                  >
                    Falar via WhatsApp
                  </a>}
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
              <a href="/#blog">Journal</a>
              <Link href="/contato">Contato</Link>
            </div>
          </div>
          <div>
            <p className="mono-label mb-5 text-[#d4af37]">Contato</p>
            <p className="text-sm text-[#9a9a9a]">
              (62) 3921 9800<br />
              contato@lopessignature.com.br<br />
              Goiânia · Goiás
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}