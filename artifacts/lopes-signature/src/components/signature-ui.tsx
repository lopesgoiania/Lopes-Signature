import './property-card.css';
import { deliveryLabel, propertyHref, propertyLocation } from '@/lib/catalog';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, BedDouble, Bookmark, ChevronLeft, ChevronRight, Eye, ExternalLink, Home, MapPin, Menu, Ruler, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { Property, Specialist } from '@workspace/api-client-react';
import casaAurora from '@assets/generated_images/casa_aurora.jpg';
import villaMare from '@assets/generated_images/villa_mare.jpg';
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
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Navegação principal">
        <Link href="/imoveis" className={`text-xs tracking-wide ${location === '/imoveis' ? 'text-primary' : 'text-[#D0D0D0] hover:text-[#F7F5F0]'}`} data-testid="link-nav-imoveis">Imóveis</Link>
        <Link href="/sobre" className={`text-xs tracking-wide ${location === '/sobre' ? 'text-primary' : 'text-[#D0D0D0] hover:text-[#F7F5F0]'}`} data-testid="link-nav-sobre">Sobre nós</Link>
        <Link href="/especialistas" className={`text-xs tracking-wide ${location === '/especialistas' ? 'text-primary' : 'text-[#D0D0D0] hover:text-[#F7F5F0]'}`} data-testid="link-nav-especialistas">Especialistas</Link>
        <Link href="/journal" className={`text-xs tracking-wide ${(location === '/conteudos' || location.startsWith('/journal')) ? 'text-primary' : 'text-[#D0D0D0] hover:text-[#F7F5F0]'}`} data-testid="link-nav-conteudos">Journal</Link>
        <Link href="/contato" className={`text-xs tracking-wide ${location === '/contato' ? 'text-primary' : 'text-[#D0D0D0] hover:text-[#F7F5F0]'}`} data-testid="link-nav-contato">Contato</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/contato" className="metal-button hidden rounded-full px-5 py-3 text-[11px] font-bold tracking-wide md:block" data-testid="link-nav-falar">Falar com um especialista</Link>
        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-primary xl:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="signature-mobile-menu" data-testid="button-open-menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
    </div>
    {open && <nav className="glass-panel mx-auto mt-2 max-w-[1280px] rounded-3xl p-4 xl:hidden" id="signature-mobile-menu" aria-label="Menu mobile">
      <Link onClick={() => setOpen(false)} href="/imoveis" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-imoveis">Imóveis</Link>
      <Link onClick={() => setOpen(false)} href="/empreendimentos" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-empreendimentos">Empreendimentos</Link>
      <Link onClick={() => setOpen(false)} href="/sobre" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-sobre">Sobre nós</Link>
      <Link onClick={() => setOpen(false)} href="/especialistas" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-especialistas">Especialistas</Link>
      <Link onClick={() => setOpen(false)} href="/journal" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-conteudos">Journal</Link>
      <Link onClick={() => setOpen(false)} href="/contato" className="block rounded-xl px-4 py-3 text-sm text-[#D0D0D0] hover:bg-white/5" data-testid="link-mobile-contato">Contato</Link>
    </nav>}
  </header>;
}

export function SectionLabel({ children }: { children: string }) {
  return <p className="mono-label mb-4 text-[#d4af37]" data-testid={`label-${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</p>;
}

export function PropertyCard({property,saved,onSave}: {property:Property;saved:boolean;onSave:()=>void;onOpenRaioX?:(p:Property)=>void;featured?:boolean}) {
 const p=property as any;const delivery=deliveryLabel(p);
 return <article className="property-card group overflow-hidden rounded-3xl border border-border bg-card" data-testid={`card-property-${p.id}`}>
 <div className="relative aspect-[16/10] overflow-hidden"><Link href={propertyHref(p)}><img src={imageFor(property)} alt={p.title} className="property-image h-full w-full object-cover" loading="lazy"/></Link><div className="absolute left-4 top-4 flex max-w-[75%] flex-wrap gap-2">{p.condition&&<span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">{p.condition}</span>}{delivery&&<span className="rounded-full border border-primary/50 bg-black/65 px-3 py-1 text-[10px] font-semibold text-white">{delivery}</span>}</div><button onClick={onSave} aria-label={saved?'Remover dos salvos':'Salvar imóvel'} aria-pressed={saved} className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md ${saved?'bg-primary text-black':'bg-black/40 text-white'}`}><Bookmark size={17} fill={saved?'currentColor':'none'}/></button></div>
 <div className="flex items-center justify-between px-5 py-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Ruler size={14} className="text-primary"/>{p.area} m²</span><span className="flex items-center gap-1"><BedDouble size={14} className="text-primary"/>{p.suites} suítes</span><span className="flex items-center gap-1"><Home size={14} className="text-primary"/>{p.parking} vagas</span></div>
 <div className="p-5 pt-0"><h3 className="serif text-2xl"><Link href={propertyHref(p)}>{p.title}</Link></h3><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} className="text-primary"/>{propertyLocation(p)}</p><p className="mt-4 text-lg font-semibold text-primary">{p.price>0?money(p.price):'Valor sob consulta'}</p><Link href={propertyHref(p)} className="metal-button flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold">Ver imóvel <ArrowRight size={14}/></Link></div></article>;
}

export function SearchBar({ onSearch, initial = '' }: { onSearch: (value: string) => void; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <form onSubmit={(event) => { event.preventDefault(); onSearch(value); }} className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-2 md:flex-row md:items-center md:rounded-full" data-testid="form-search-properties">
    <div className="flex flex-1 items-center gap-3 px-4"><Search size={18} className="text-[#d4af37]" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Busque por cidade, bairro ou nome" className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" aria-label="Buscar imóveis" data-testid="input-search-properties" /></div>
    <select className="h-12 rounded-full border border-border bg-background px-4 text-xs text-foreground outline-none" aria-label="Selecionar região" data-testid="select-region"><option value="all">Todas as regiões</option><option>São Paulo</option><option>Bahia</option><option>Rio de Janeiro</option></select>
    <button type="button" onClick={() => onSearch(value)} className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#d4af37]/30 px-5 text-xs text-[#e8c766] hover:bg-[#d4af37]/10" data-testid="button-open-filters"><SlidersHorizontal size={15} /> Filtros</button>
    <button type="submit" className="metal-button h-12 rounded-full px-7 text-xs font-bold" data-testid="button-search-properties">Buscar imóveis</button>
  </form>;
}

export function SkeletonGrid() {
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-3xl border border-border bg-card" data-testid={`skeleton-property-${item}`}><div className="skeleton aspect-[16/10]" /><div className="space-y-3 p-5"><div className="skeleton h-4 w-1/3 rounded" /><div className="skeleton h-7 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /></div></div>)}</div>;
}

export function EmptyState({ title, description, onReset }: { title: string; description: string; onReset?: () => void }) {
  return <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center" data-testid="empty-state"><Sparkles className="mx-auto mb-4 text-[#d4af37]" size={25} /><h3 className="serif text-3xl text-foreground">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{onReset && <button onClick={onReset} className="mt-6 rounded-full border border-[#d4af37]/50 px-5 py-3 text-xs text-[#e8c766] hover:bg-[#d4af37]/10" data-testid="button-reset-filters">Limpar filtros</button>}</div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-3xl border border-[#e0554a]/30 bg-[#e0554a]/5 px-6 py-12 text-center" data-testid="error-state"><p className="mono-label text-[#e0554a]">Não foi possível carregar</p><p className="mt-2 text-sm text-[#c9c9c9]">O catálogo está temporariamente indisponível.</p><button onClick={onRetry} className="mt-5 rounded-full border border-[#e0554a]/50 px-5 py-3 text-xs text-[#e8c766]" data-testid="button-retry">Tentar novamente</button></div>;
}

export function SpecialistAvatar({ specialist, size = 'md' }: { specialist: Specialist; size?: 'sm' | 'md' }) {
  return <div className={`${size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'} overflow-hidden rounded-full border border-border bg-muted`}><img src={specialist.image || fallbackImages[0]} alt={specialist.name} className="h-full w-full object-cover" /></div>;
}

export function Lightbox({ images, active, onClose, onPrev, onNext }: { images: string[]; active: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Galeria ampliada"><button onClick={onClose} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white" aria-label="Fechar galeria" data-testid="button-close-lightbox"><X /></button><button onClick={onPrev} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 text-[#d4af37]" aria-label="Imagem anterior" data-testid="button-lightbox-prev"><ChevronLeft /></button><img src={images[active]} alt={`Imagem ${active + 1}`} className="max-h-[82vh] max-w-[90vw] rounded-2xl object-contain" data-testid="img-lightbox" /><button onClick={onNext} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 text-[#d4af37]" aria-label="Próxima imagem" data-testid="button-lightbox-next"><ChevronRight /></button><span className="absolute bottom-6 rounded-full bg-black/50 px-4 py-2 text-xs text-[#c9c9c9]">{active + 1} / {images.length}</span></div>;
}