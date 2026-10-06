import { useState } from 'react';
import { useListProperties } from '@workspace/api-client-react';
import { PublicNav, SearchBar, PropertyCard, SkeletonGrid, ErrorState, EmptyState, SectionLabel, PageLogo } from '@/components/signature-ui';
import { RaioXModal } from '@/components/raio-x-modal';
import type { Property } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Instagram, Linkedin, Mail } from 'lucide-react';

export default function CatalogPage({ category, title, description }: { category?: string, title: string, description: string }) {
  const [search, setSearch] = useState(category || '');
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('lopes-saved') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedRaioXProperty, setSelectedRaioXProperty] = useState<Property | null>(null);

  const propertyQuery = useListProperties(search ? { search } : undefined);
  const properties = Array.isArray(propertyQuery.data) ? propertyQuery.data : [];

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next); localStorage.setItem('lopes-saved', JSON.stringify(next));
  }

  return <div className="signature-shell noise min-h-[100dvh] text-foreground bg-background">
    <PublicNav />
    <main className="pt-32">
      <section className="mx-auto max-w-[1280px] px-5 pb-12 md:px-10">
        <div className="mb-10 max-w-2xl">
          <SectionLabel>CATÁLOGO SIGNATURE</SectionLabel>
          <h1 className="serif text-4xl text-foreground md:text-5xl mt-2 mb-4">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="mb-12 max-w-[800px]">
          <SearchBar onSearch={setSearch} initial={search} />
        </div>

        {propertyQuery.isLoading ? <SkeletonGrid /> : propertyQuery.isError ? <ErrorState onRetry={() => propertyQuery.refetch()} /> : properties.length === 0 ? <EmptyState title="Nenhum imóvel encontrado" description="Refine sua busca ou fale com a equipe para mapear opções no mercado." onReset={() => setSearch('')} /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} saved={saved.includes(property.id)} onSave={() => toggleSave(property.id)} onOpenRaioX={(prop) => setSelectedRaioXProperty(prop)} />)}</div>}
      </section>
    </main>

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
            <a href="https://instagram.com" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5"><Instagram size={16} /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5"><Linkedin size={16} /></a>
            <a href="mailto:contato@lopessignature.com.br" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary hover:bg-white/5"><Mail size={16} /></a>
          </div>
        </div>
        <div>
          <p className="mono-label mb-5 text-primary">Navegue</p>
          <div className="flex flex-col gap-3 text-sm text-[#D0D0D0]">
            <Link href="/imoveis" className="hover:text-primary">Imóveis</Link>
            <Link href="/empreendimentos" className="hover:text-primary">Empreendimentos</Link>
            <Link href="/especialistas" className="hover:text-primary">Especialistas</Link>
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>;
}
