import { SiteFooter } from "@/components/site-footer";
import { ResponsiveImage } from '@/components/responsive-image';
import './specialists-design-preview.css';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'wouter';
import specialists from '../../../api-server/src/data/specialists.json';
import { PageLogo, PublicNav } from '@/components/signature-ui';

export default function SpecialistsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('todos');

  const roleFilters = Array.from(new Set(specialists.map(person => person.role.split(' - ').pop()?.trim()).filter((role): role is string => Boolean(role))));

  const filteredSpecialists = selectedRole === 'todos'
    ? specialists
    : specialists.filter(s => s.role.split(' - ').pop()?.trim() === selectedRole);

  return (
    <div className="signature-shell specialists-page specialists-preview min-h-[100dvh] text-foreground">
      <PublicNav />

      <main className="pt-28 md:pt-36">
        {/* Banner de Topo / Hero da Página */}
        <section className="specialists-intro relative border-b border-white/10 px-5 pb-16 pt-10 md:px-10 md:pb-24">
          <div className="specialists-intro-inner mx-auto max-w-[1280px]">

            <h1 className="serif specialist-heading text-5xl leading-[1.08] text-foreground md:text-7xl">
              Especialistas em <br />
              <em className="font-normal text-[#876526]">alto padrão.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#59564e]">
              Conheça a equipe de especialistas da <strong>Lopes Signature</strong>. Conhecimento do mercado de Goiânia e atendimento próximo para orientar sua escolha.
            </p>
          </div>
        </section>

        {/* Lista de Especialistas */}
        <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28" id="time">
          <div className="specialists-directory-header mb-10 flex flex-col justify-between gap-6">
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

          <div className="specialists-directory-grid grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialists.map((person) => (
              <article
                key={person.id}
                data-no-portrait={!person.image}
                className="specialist-card relative flex flex-col overflow-hidden rounded-xl bg-[#121212]"
              >
                {person.image && <div className="specialist-portrait relative aspect-[4/5] w-full bg-[#191918]">
                  <ResponsiveImage
                    src={person.image}
                    alt={`Retrato de ${person.name}`}
                    loading="lazy" decoding="async"
                    className="absolute inset-0 h-full w-full object-contain object-center p-4"
                  />
                </div>}
                <div className="specialists-profile-copy flex flex-1 flex-col p-6">
                <p className="text-xs leading-5 tracking-wide text-[#d8bc7c]">{person.role}</p>
                <h3 className="serif mt-2 text-3xl text-white">{person.name}</h3>
                <p className="mt-2 text-xs text-[#bcb8af]">
                  {person.credential}
                </p>
                {person.bio && <p className="mt-4 flex-1 text-sm leading-6 text-[#bcb8af]">{person.bio}</p>}

                <div className="specialists-profile-actions mt-8 flex gap-3 border-t border-white/10 pt-5">
                  {person.whatsapp && <a
                    href={`https://wa.me/${person.whatsapp}?text=Olá%20${encodeURIComponent(person.name)},%20gostaria%20de%20falar%20sobre%20os%20imóveis%20Lopes%20Signature.`}
                    target="_blank"
                    rel="noreferrer"
                    className="specialist-contact flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 py-3 text-center text-sm font-semibold"
                  >
                    Falar via WhatsApp
                  </a>}
                  <Link
                    href="/contato"
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/10 ${person.whatsapp ? "w-11" : "flex-1 px-3 py-3 text-sm"}`}
                    title="Agendar reunião"
                    aria-label={`Agendar reunião com ${person.name}`}
                  >
                    <Mail size={18} />{!person.whatsapp && "Agendar conversa"}
                  </Link>
                </div>
                </div>
              </article>
            ))}
          </div>
          {filteredSpecialists.length === 0 && <p role="status" className="py-12 text-muted-foreground">Nenhum especialista nesta unidade.</p>}
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
