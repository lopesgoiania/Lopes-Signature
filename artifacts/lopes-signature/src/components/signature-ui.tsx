import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, BedDouble, Bookmark, ChevronLeft, ChevronRight, Eye, ExternalLink, Home, MapPin, Menu, Ruler, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { Property, Specialist } from '@workspace/api-client-react';
import casaAurora from '@assets/generated_images/casa_aurora.jpg';
import villaMare from '@assets/generated_images/villa_maré.jpg';
import penthouseIbirapuera from '@assets/generated_images/penthouse_ibirapuera.jpg';
import quintaLume from '@assets/generated_images/quinta_lume.jpg';
import homeReference from '@assets/image_1788303912918.png';

export const propertyImages = [
  casaAurora,
  villaMare,
  penthouseIbirapuera,
  quintaLume,
];

export const fallbackImages = [
  homeReference,
  casaAurora,
  villaMare,
];

export function imageFor(property: Property, index = 0) {
  return property.images?.[index] || propertyImages[index % propertyImages.length] || fallbackImages[index % fallbackImages.length];
}

export function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export function PageLogo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
    <img src="/images/logo-signature.png" alt="Lopes Signature" className={compact ? "h-8 w-auto object-contain" : "h-10 md:h-12 w-auto object-contain"} />
  </Link>;
}

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-4 md:px-8 md:pt-6">
    <div className="glass-panel mx-auto flex h-[62px] max-w-[1280px] items-center justify-between rounded-full px-4 md:h-[72px] md:px-7">
      <PageLogo />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
        <Link href="/" className={`text-xs tracking-wide ${location === '/' ? 'text-[#d4af37]' : 'text-[#c9c9c9] hover:text-white'}`} data-testid="link-nav-inicio">Início</Link>
        <a href="/#catalogo" className="text-xs tracking-wide text-[#c9c9c9] hover:text-white" data-testid="link-nav-imoveis">Imóveis</a>
        <Link href="/especialistas" className={`text-xs tracking-wide ${location === '/especialistas' || location === '/sobre' ? 'text-[#d4af37]' : 'text-[#c9c9c9] hover:text-white'}`} data-testid="link-nav-especialistas">Sobre Nós & Especialistas</Link>
        <a href="/#blog" className="text-xs tracking-wide text-[#c9c9c9] hover:text-white" data-testid="link-nav-blog">Notícias</a>
        <Link href="/contato" className={`text-xs tracking-wide ${location === '/contato' ? 'text-[#d4af37]' : 'text-[#c9c9c9] hover:text-white'}`} data-testid="link-nav-contato">Contato</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/contato" className="metal-button hidden rounded-full px-5 py-3 text-[11px] font-bold tracking-wide md:block" data-testid="link-nav-visita">Agendar visita</Link>
        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#d4af37] lg:hidden" aria-label="Abrir menu" data-testid="button-open-menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
    </div>
    {open && <nav className="glass-panel mx-auto mt-2 max-w-[1280px] rounded-3xl p-4 lg:hidden" aria-label="Menu mobile">
      <Link onClick={() => setOpen(false)} href="/" className="block rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5" data-testid="link-mobile-inicio">Início</Link>
      <a onClick={() => setOpen(false)} href="/#catalogo" className="block rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5" data-testid="link-mobile-imoveis">Imóveis</a>
      <Link onClick={() => setOpen(false)} href="/especialistas" className="block rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5" data-testid="link-mobile-especialistas">Sobre Nós & Especialistas</Link>
      <a onClick={() => setOpen(false)} href="/#blog" className="block rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5" data-testid="link-mobile-blog">Notícias</a>
      <Link onClick={() => setOpen(false)} href="/contato" className="block rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5" data-testid="link-mobile-contato">Contato</Link>
    </nav>}
  </header>;
}

export function SectionLabel({ children }: { children: string }) {
  return <p className="mono-label mb-4 text-[#d4af37]" data-testid={`label-${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</p>;
}

export function PropertyCard({
  property,
  saved,
  onSave,
  onOpenRaioX,
  featured = false,
}: {
  property: Property;
  saved: boolean;
  onSave: () => void;
  onOpenRaioX?: (p: Property) => void;
  featured?: boolean;
}) {
  return (
    <article className="property-card group overflow-hidden rounded-3xl border border-white/10 bg-[#121212]" data-testid={`card-property-${property.id}`}>
      <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-[16/10]'}`}>
        <img src={imageFor(property)} alt={property.title} className="property-image h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {(property.badges || []).slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-[#d4af37] px-3 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#0a0a0a]">
              {badge}
            </span>
          ))}
          {property.featured && (
            <span className="rounded-full border border-[#d4af37]/60 bg-black/45 px-3 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#f4e5a8]">
              Signature
            </span>
          )}
        </div>
        <button
          onClick={onSave}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md ${saved ? 'border-[#d4af37] bg-[#d4af37] text-[#0a0a0a]' : 'border-white/20 bg-black/30 text-white hover:border-[#d4af37]'
            }`}
          aria-label={saved ? 'Remover dos salvos' : 'Salvar imóvel'}
          data-testid={`button-save-${property.id}`}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/70">{(property as any).builder || property.category}</p>
            <h3 className="serif text-2xl text-white">{property.title}</h3>
            <p className="flex items-center gap-1 text-xs text-white/70">
              <MapPin size={12} className="text-[#d4af37]" />
              {property.neighborhood}, {property.location}
            </p>
          </div>
          <p className="text-right text-lg font-bold text-[#e8c766]">{money(property.price)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 text-xs text-[#9a9a9a]">
        <span className="flex items-center gap-1">
          <Ruler size={14} className="text-[#d4af37]" />
          {property.area} m²
        </span>
        <span className="flex items-center gap-1">
          <BedDouble size={14} className="text-[#d4af37]" />
          {property.suites || property.bedrooms} suítes
        </span>
        <span className="flex items-center gap-1">
          <Home size={14} className="text-[#d4af37]" />
          {property.parking} vagas
        </span>
      </div>

      {/* Ações de Raio-X (Ícone de Olho) e Visitar o site (Landing Page) */}
      <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3">
        <button
          onClick={() => onOpenRaioX && onOpenRaioX(property)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white hover:border-[#00a884] hover:bg-[#00a884]/10 hover:text-[#00a884] transition"
          title="Ver Raio-X completo com plantas e especificações"
        >
          <Eye size={15} /> Raio-X
        </button>

        <Link
          href={(property as any).lpUrl || `/property/${property.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 py-2.5 text-xs font-semibold text-[#e8c766] hover:bg-[#d4af37]/20 transition"
        >
          Visitar o site <ExternalLink size={13} />
        </Link>
      </div>
    </article>
  );
}

export function SearchBar({ onSearch, initial = '' }: { onSearch: (value: string) => void; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <form onSubmit={(event) => { event.preventDefault(); onSearch(value); }} className="flex flex-col gap-2 rounded-3xl border border-[#d4af37]/20 bg-[#161616] p-2 md:flex-row md:items-center md:rounded-full" data-testid="form-search-properties">
    <div className="flex flex-1 items-center gap-3 px-4"><Search size={18} className="text-[#d4af37]" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Busque por cidade, bairro ou nome" className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7a7a7a]" aria-label="Buscar imóveis" data-testid="input-search-properties" /></div>
    <select className="h-12 rounded-full border border-white/10 bg-[#0f0f0f] px-4 text-xs text-[#c9c9c9] outline-none" aria-label="Selecionar região" data-testid="select-region"><option value="all">Todas as regiões</option><option>São Paulo</option><option>Bahia</option><option>Rio de Janeiro</option></select>
    <button type="button" onClick={() => onSearch(value)} className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d4af37]/30 px-5 text-xs text-[#e8c766] hover:bg-[#d4af37]/10" data-testid="button-open-filters"><SlidersHorizontal size={15} /> Filtros</button>
    <button type="submit" className="metal-button h-12 rounded-full px-7 text-xs font-bold" data-testid="button-search-properties">Buscar imóveis</button>
  </form>;
}

export function SkeletonGrid() {
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212]" data-testid={`skeleton-property-${item}`}><div className="skeleton aspect-[16/10]" /><div className="space-y-3 p-5"><div className="skeleton h-4 w-1/3 rounded" /><div className="skeleton h-7 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /></div></div>)}</div>;
}

export function EmptyState({ title, description, onReset }: { title: string; description: string; onReset?: () => void }) {
  return <div className="rounded-3xl border border-dashed border-[#d4af37]/30 bg-[#121212] px-6 py-16 text-center" data-testid="empty-state"><Sparkles className="mx-auto mb-4 text-[#d4af37]" size={25} /><h3 className="serif text-3xl text-white">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#9a9a9a]">{description}</p>{onReset && <button onClick={onReset} className="mt-6 rounded-full border border-[#d4af37]/50 px-5 py-3 text-xs text-[#e8c766] hover:bg-[#d4af37]/10" data-testid="button-reset-filters">Limpar filtros</button>}</div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-3xl border border-[#e0554a]/30 bg-[#e0554a]/5 px-6 py-12 text-center" data-testid="error-state"><p className="mono-label text-[#e0554a]">Não foi possível carregar</p><p className="mt-2 text-sm text-[#c9c9c9]">O catálogo está temporariamente indisponível.</p><button onClick={onRetry} className="mt-5 rounded-full border border-[#e0554a]/50 px-5 py-3 text-xs text-[#e8c766]" data-testid="button-retry">Tentar novamente</button></div>;
}

export function SpecialistAvatar({ specialist, size = 'md' }: { specialist: Specialist; size?: 'sm' | 'md' }) {
  return <div className={`${size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'} overflow-hidden rounded-full border border-[#d4af37]/50 bg-[#2a2a2a]`}><img src={specialist.image || fallbackImages[0]} alt={specialist.name} className="h-full w-full object-cover" /></div>;
}

export function Lightbox({ images, active, onClose, onPrev, onNext }: { images: string[]; active: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Galeria ampliada"><button onClick={onClose} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white" aria-label="Fechar galeria" data-testid="button-close-lightbox"><X /></button><button onClick={onPrev} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 text-[#d4af37]" aria-label="Imagem anterior" data-testid="button-lightbox-prev"><ChevronLeft /></button><img src={images[active]} alt={`Imagem ${active + 1}`} className="max-h-[82vh] max-w-[90vw] rounded-2xl object-contain" data-testid="img-lightbox" /><button onClick={onNext} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 text-[#d4af37]" aria-label="Próxima imagem" data-testid="button-lightbox-next"><ChevronRight /></button><span className="absolute bottom-6 rounded-full bg-black/50 px-4 py-2 text-xs text-[#c9c9c9]">{active + 1} / {images.length}</span></div>;
}