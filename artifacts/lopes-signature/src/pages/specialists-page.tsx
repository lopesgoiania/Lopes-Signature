import './specialists-design-preview.css';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'wouter';
import { useListSpecialists, type Specialist } from '@workspace/api-client-react';
import { PageLogo, PublicNav } from '@/components/signature-ui';

export default function SpecialistsPage() {
  const { data: specialistsFromQuery, isLoading, isError, refetch } = useListSpecialists();
  const specialists: Specialist[] = Array.isArray(specialistsFromQuery) ? specialistsFromQuery : [];
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
                className="specialist-card relative flex flex-col overflow-hidden rounded-xl bg-[#121212]"
              >
                <div className="specialist-portrait relative aspect-[4/5] w-full bg-[#191918]">
                  <img
                    src={person.image || '/images/logo-signature.png'}
                    alt={`Retrato de ${person.name}`}
                    loading="lazy" decoding="async"
                    className="absolute inset-0 h-full w-full object-contain object-center p-4"
                  />
                </div>
                <div className="specialists-profile-copy flex flex-1 flex-col p-6">
                <p className="text-xs leading-5 tracking-wide text-[#d8bc7c]">{person.role}</p>
                <h3 className="serif mt-2 text-3xl text-white">{person.name}</h3>
                <p className="mt-2 text-xs text-[#bcb8af]">
                  {person.credential}
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#bcb8af]">{person.bio}</p>

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
          {isLoading ? <p role="status" className="py-12 text-muted-foreground">Carregando especialistas…</p> : isError ? <div role="alert" className="py-12 text-muted-foreground"><p>Não foi possível carregar a equipe.</p><button onClick={() => refetch()} className="mt-3 min-h-11 underline">Tentar novamente</button></div> : filteredSpecialists.length === 0 && <p role="status" className="py-12 text-muted-foreground">Nossa equipe será apresentada aqui. <Link href="/contato" className="underline">Fale com a Lopes Signature.</Link></p>}
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
              <Link href="/journal" className="hover:text-primary">Journal</Link>
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
