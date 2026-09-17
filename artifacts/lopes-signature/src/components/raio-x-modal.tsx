import { useState } from 'react';
import { Bath, BedDouble, Car, Download, ExternalLink, MapPin, MessageSquare, Ruler, X } from 'lucide-react';
import { useCreateLead, type Property } from '@workspace/api-client-react';
import { money } from '@/components/signature-ui';

export interface LocalFloorplan {
  id: string;
  title: string;
  area: string;
  price: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking: number;
  image: string;
}

interface RaioXModalProps {
  property: Property | null;
  onClose: () => void;
}

export function RaioXModal({ property, onClose }: RaioXModalProps) {
  if (!property) return null;

  const floorplans: LocalFloorplan[] = (property as any).floorplans && (property as any).floorplans.length > 0
    ? (property as any).floorplans
    : [
      {
        id: 'fp-1',
        title: `Planta ${property.area || 398}m²`,
        area: `${property.area || 398}m²`,
        price: property.price,
        bedrooms: property.bedrooms || 4,
        suites: property.suites || 4,
        bathrooms: (property as any).bathrooms || 6,
        parking: property.parking || 4,
        image: property.images?.[0] || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      },
    ];

  const [activeFloorplan, setActiveFloorplan] = useState<LocalFloorplan>(floorplans[0]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const createLead = useCreateLead();

  const gallery: string[] = (property as any).gallery && (property as any).gallery.length > 0
    ? (property as any).gallery
    : property.images || [];

  const whatsappMessage = encodeURIComponent(`Olá, gostaria de receber o material completo do empreendimento ${property.title}.`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 overflow-y-auto">
      {/* Modal Box */}
      <div className="relative my-auto w-full max-w-[1200px] overflow-hidden rounded-2xl border border-white/15 bg-[#121214] text-[#f5f2e9] shadow-2xl">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0c0c0e] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37]/20 text-xs font-bold text-[#e8c766]">
              RX
            </span>
            <span className="text-xs font-mono tracking-wider text-[#9a9a9a]">
              Produto #{property.id} — <strong className="text-white font-sans">{property.title}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9a9a9a] hover:border-white/30 hover:text-white transition"
            aria-label="Fechar Raio-X"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[82vh] overflow-y-auto p-6 md:p-10 space-y-10">

          {/* Main Title & Action Bar */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-white/10 pb-8">
            <div>
              <h1 className="serif text-4xl text-white md:text-5xl font-normal">
                {property.title} <span className="text-xl text-[#9a9a9a] font-sans font-light">{(property as any).builder || 'Lopes Signature'}</span>
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#a0a0a0]">
                <MapPin size={16} className="text-[#d4af37]" />
                {(property as any).address || `${property.neighborhood}, ${property.location}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(property as any).pdfUrl && (
                <a
                  href={(property as any).pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-medium text-white hover:border-[#d4af37] hover:text-[#e8c766] transition"
                >
                  <Download size={15} /> Baixar material
                </a>
              )}
              
              {showLeadForm ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    createLead.mutate({
                      data: {
                        name: String(form.get('name') || ''),
                        email: String(form.get('email') || ''),
                        phone: String(form.get('phone') || ''),
                        propertyId: property.id,
                        propertyTitle: property.title,
                        status: 'new',
                        source: 'raio-x',
                        note: 'Interesse gerado pelo Raio-X'
                      }
                    });
                  }}
                  className="flex flex-col gap-2 rounded-xl bg-[#161619] p-4 border border-white/10 shadow-lg min-w-[280px]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Receber Informações</span>
                    <button type="button" onClick={() => setShowLeadForm(false)} className="text-[#9a9a9a] hover:text-white"><X size={14} /></button>
                  </div>
                  <input name="name" required placeholder="Seu nome" className="h-10 rounded-lg border border-white/15 bg-black/20 px-3 text-xs text-white outline-none focus:border-[#d4af37]" />
                  <input name="phone" required placeholder="Seu telefone" className="h-10 rounded-lg border border-white/15 bg-black/20 px-3 text-xs text-white outline-none focus:border-[#d4af37]" />
                  <input name="email" type="email" required placeholder="seu@email.com" className="h-10 rounded-lg border border-white/15 bg-black/20 px-3 text-xs text-white outline-none focus:border-[#d4af37]" />
                  <button type="submit" className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#e8c766] transition">
                    {createLead.isPending ? 'Enviando...' : 'Enviar Solicitação'}
                  </button>
                  {createLead.isSuccess && <p className="text-[10px] text-[#7acb8e] mt-1 text-center">Enviado com sucesso!</p>}
                </form>
              ) : (
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-6 py-3 text-xs font-bold text-black hover:bg-[#e8c766] transition shadow-lg"
                >
                  <MessageSquare size={15} /> Saiba mais
                </button>
              )}

              {property.lpUrl && (
                <a
                  href={property.lpUrl}
                  className="flex items-center gap-2 rounded-xl border border-[#d4af37]/60 bg-[#d4af37]/10 px-5 py-3 text-xs font-bold text-[#e8c766] hover:bg-[#d4af37]/20 transition"
                >
                  <ExternalLink size={15} /> Visitar Landing Page
                </a>
              )}
            </div>
          </div>

          {/* Seção de Plantas Técnicas (Baseada fielmente na Imagem de Referência 1) */}
          <div>
            <h2 className="mono-label mb-4 text-xs text-[#d4af37]">Plantas & Especificações</h2>
            <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">

              {/* Lado Esquerdo: Cards de Seleção de Plantas */}
              <div className="space-y-3">
                {floorplans.map((fp) => {
                  const isActive = activeFloorplan.id === fp.id;
                  return (
                    <div
                      key={fp.id}
                      onClick={() => setActiveFloorplan(fp)}
                      className={`cursor-pointer rounded-2xl border p-5 transition ${isActive
                          ? 'border-[#00a884] bg-[#00a884]/15 text-white shadow-lg'
                          : 'border-white/10 bg-[#161619] text-[#a0a0a0] hover:border-white/25 hover:bg-[#1c1c20]'
                        }`}
                    >
                      <p className="serif text-xl font-medium text-white">{fp.title}</p>
                      <p className="mt-1 text-lg font-bold text-[#e8c766]">{money(fp.price)}</p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <span className="flex items-center gap-1.5 text-[#c9c9c9]">
                          <BedDouble size={14} className="text-[#d4af37]" /> {fp.bedrooms} quartos ({fp.suites} suítes)
                        </span>
                        <span className="flex items-center gap-1.5 text-[#c9c9c9]">
                          <Bath size={14} className="text-[#d4af37]" /> {fp.bathrooms || 5} banheiros
                        </span>
                        <span className="flex items-center gap-1.5 text-[#c9c9c9]">
                          <Car size={14} className="text-[#d4af37]" /> {fp.parking} vagas
                        </span>
                        <span className="flex items-center gap-1.5 text-[#c9c9c9]">
                          <Ruler size={14} className="text-[#d4af37]" /> {fp.area}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lado Direito: Imagem Ampliada da Planta Selecionada */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] p-4 text-center">
                <img
                  src={activeFloorplan.image || property.images?.[0]}
                  alt={activeFloorplan.title}
                  className="mx-auto max-h-[500px] w-full object-contain rounded-xl"
                />
                <div className="mt-3 flex items-center justify-between px-2 text-xs text-[#7a7a7a]">
                  <span>Visualização Técnica — {activeFloorplan.title}</span>
                  <span className="text-[#e8c766] font-mono">{activeFloorplan.area}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Descrição Completa */}
          <div className="rounded-2xl border border-white/10 bg-[#161619] p-6 md:p-8">
            <h3 className="serif text-2xl text-white mb-4">Descrição do Empreendimento</h3>
            <p className="text-sm leading-7 text-[#c9c9c9] whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Seção Galeria de Fotos (Baseada fielmente nas Imagens de Referência 2 e 3) */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="serif text-2xl text-white">Galeria de Fotos do Projeto</h3>
              <span className="text-xs text-[#7a7a7a]">{gallery.length} fotos em alta resolução</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((photo: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#18181c]"
                >
                  <img
                    src={photo}
                    alt={`${property.title} - Foto ${idx + 1}`}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 transition duration-300 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white">
                    Ampliar
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal de Foto Selecionada */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4"
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Foto ampliada"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
