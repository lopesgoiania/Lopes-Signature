function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : u.searchParams.get("v") || u.pathname.split("/").pop();
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? "https://www.youtube-nocookie.com/embed/" + id
      : "";
  } catch {
    return "";
  }
}
import { PropertyPlans } from "@/components/property-plans";
import { deliveryLabel, propertyLocation } from "@/lib/catalog";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Car,
  Check,
  Download,
  MapPin,
  Ruler,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import {
  useCreateLead,
  useGetProperty,
  useListSpecialists,
} from "@workspace/api-client-react";
import {
  ErrorState,
  Lightbox,
  PageLogo,
  PublicNav,
  SectionLabel,
  SpecialistAvatar,
  fallbackImages,
  imageFor,
  money,
} from "@/components/signature-ui";

export default function PropertyDetailPage({
  suppliedProperty,
}: { suppliedProperty?: any } = {}) {
  const { id = "" } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const query = useGetProperty(id, {
    query: { queryKey: ["/api/properties", id], enabled: !suppliedProperty },
  });

  const createLead = useCreateLead();
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const property = suppliedProperty || query.data;
  const images = useMemo(
    () => [
      ...new Set<string>([
        ...(property?.images || []),
        ...(property?.gallery || []),
      ]),
    ],
    [property],
  );

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    createLead.mutate(
      {
        data: {
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          phone: String(form.get("phone") || ""),
          propertyId: property?.id || id,
          propertyTitle: property?.title || "",
          status: "new",
          source: "property-page",
          note: String(
            form.get("message") || "Solicitou uma visita pelo portal.",
          ),
        },
      },
      { onSuccess: () => element.reset() },
    );
  }

  if (query.isLoading && !property)
    return (
      <div className="signature-shell min-h-[100dvh] pt-32">
        <PublicNav />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="skeleton aspect-[16/7] rounded-3xl" />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="skeleton h-52 rounded-3xl" />
            <div className="skeleton h-52 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  if (query.isError && !property)
    return (
      <div className="signature-shell min-h-[100dvh] pt-32">
        <PublicNav />
        <div className="mx-auto max-w-3xl px-5 py-24">
          <ErrorState onRetry={() => query.refetch()} />
        </div>
      </div>
    );
  if (!property)
    return (
      <div className="signature-shell min-h-[100dvh] pt-32">
        <PublicNav />
        <div className="mx-auto max-w-3xl px-5 py-24">
          <ErrorState onRetry={() => setLocation("/")} />
        </div>
      </div>
    );

  const specs = [
    { icon: Ruler, value: `${property.area} m²`, label: "Área construída" },
    { icon: BedDouble, value: `${property.bedrooms}`, label: "Quartos" },
    { icon: Bath, value: `${property.suites}`, label: "Suítes" },
    { icon: Car, value: `${property.parking}`, label: "Vagas" },
  ];
  return (
    <div className="signature-shell catalog-detail min-h-[100dvh] text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <div className="mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
            data-testid="link-back-catalog"
          >
            <ArrowLeft size={15} /> Voltar à seleção
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
              className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-xs text-muted-foreground hover:border-[#d4af37]"
              data-testid="button-share-property"
            >
              <Share2 size={14} /> Compartilhar
            </button>
            <button
              onClick={() => setLocation("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-[#d4af37]"
              aria-label="Fechar"
              data-testid="button-close-property"
            >
              <X size={15} />
            </button>
          </div>
        </div>
        <section className="grid gap-3 md:grid-cols-[1.45fr_.55fr] md:grid-rows-2">
          <button
            onClick={() => setLightbox(true)}
            className="group relative row-span-2 overflow-hidden rounded-3xl text-left"
            data-testid="button-open-gallery"
          >
            <img
              src={images[0]}
              alt={property.title}
              className="h-full min-h-[330px] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
            />
            <span className="absolute bottom-5 left-5 rounded-full bg-black/55 px-4 py-2 text-xs text-white backdrop-blur">
              Abrir galeria · {images.length} imagens
            </span>
          </button>
          <button
            onClick={() => {
              setActiveImage(1 % images.length);
              setLightbox(true);
            }}
            className="hidden overflow-hidden rounded-3xl md:block"
            data-testid="button-gallery-thumbnail-1"
          >
            <img
              src={images[1 % images.length]}
              alt=""
              className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
            />
          </button>
          <button
            onClick={() => {
              setActiveImage(2 % images.length);
              setLightbox(true);
            }}
            className="hidden overflow-hidden rounded-3xl md:block"
            data-testid="button-gallery-thumbnail-2"
          >
            <img
              src={images[2 % images.length]}
              alt=""
              className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
            />
          </button>
        </section>
        <section className="grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:gap-20">
          <div>
            <div className="flex flex-wrap gap-2">
              {[property.condition, deliveryLabel(property)]
                .filter(Boolean)
                .map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-[#d4af37] px-3 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-black"
                  >
                    {badge}
                  </span>
                ))}
              <span className="rounded-full border border-border px-3 py-1 text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                {property.category}
              </span>
            </div>
            {property.builder && (
              <p className="mt-5 text-sm text-muted-foreground">
                {property.builder}
              </p>
            )}
            <h1
              className="serif mt-5 text-5xl leading-[.95] text-foreground md:text-7xl"
              data-testid="text-property-title"
            >
              {property.title}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="text-[#d4af37]" />
              {propertyLocation(property)}
            </p>
            <p
              className="mt-9 max-w-2xl text-base leading-8 text-muted-foreground"
              data-testid="text-property-description"
            >
              {property.description}
            </p>
            <div className="my-10 gold-line max-w-2xl" />
            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
              {specs.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex gap-3">
                  <Icon
                    size={22}
                    className="text-[#d4af37]"
                    strokeWidth={1.4}
                  />
                  <div>
                    <p className="text-lg text-foreground">{value}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {property.address && (
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                <strong>Endereço:</strong> {property.address}
              </p>
            )}
            {Number(property.bathrooms) > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {property.bathrooms} banheiros
              </p>
            )}
            {(property.features || []).length > 0 && (
              <div className="mt-12">
                <SectionLabel>O que torna este endereço especial</SectionLabel>
                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {(property.features || []).map((item: string) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Check size={16} className="text-[#d4af37]" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="map-grid relative mt-12 h-56 overflow-hidden rounded-3xl border border-border">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,transparent_0,rgba(10,10,10,.2)_60%,rgba(10,10,10,.7)_100%)]" />
              <div className="absolute left-[56%] top-[43%]">
                <span className="absolute -inset-3 animate-ping rounded-full bg-[#d4af37]/30" />
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#f4e5a8] bg-[#d4af37] text-black">
                  <MapPin size={15} />
                </span>
              </div>
              <p className="absolute bottom-4 left-4 mono-label text-muted-foreground">
                Localização aproximada · {property.neighborhood}
              </p>
            </div>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-[#d4af37]/30 bg-card p-6 md:p-8">
              <p className="mono-label text-muted-foreground">
                Valor de referência
              </p>
              <p
                className="mt-2 text-3xl font-bold text-primary"
                data-testid="text-property-price"
              >
                {money(property.price)}
              </p>
              <div className="my-6 gold-line" />
              <p className="mb-4 text-sm text-muted-foreground">
                Conheça este imóvel em uma visita reservada.
              </p>
              <form
                id="agendar"
                onSubmit={submitLead}
                className="space-y-3"
                data-testid="form-property-lead"
              >
                <input
                  name="name"
                  required
                  placeholder="Seu nome"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-[#d4af37]"
                  data-testid="input-lead-name"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Seu email"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-[#d4af37]"
                  data-testid="input-lead-email"
                />
                <input
                  name="phone"
                  required
                  placeholder="WhatsApp"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-[#d4af37]"
                  data-testid="input-lead-phone"
                />
                <textarea
                  name="message"
                  placeholder="Como podemos preparar sua visita?"
                  className="min-h-20 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-[#d4af37]"
                  data-testid="input-lead-message"
                />
                <button
                  type="submit"
                  disabled={createLead.isPending}
                  className="metal-button flex h-13 w-full items-center justify-center gap-2 rounded-full text-xs font-bold"
                  data-testid="button-submit-lead"
                >
                  {createLead.isPending
                    ? "Enviando solicitação"
                    : "Agendar visita privada"}{" "}
                  <ArrowUpRight size={16} />
                </button>
                {createLead.isSuccess && (
                  <p
                    className="flex items-center gap-2 text-xs text-[#7acb8e]"
                    data-testid="status-lead-success"
                  >
                    <ShieldCheck size={14} /> Recebemos seu pedido. Retornaremos
                    em breve.
                  </p>
                )}
                {createLead.isError && (
                  <p
                    className="text-xs text-[#e0554a]"
                    data-testid="status-lead-error"
                  >
                    Não foi possível enviar. Tente novamente.
                  </p>
                )}
              </form>
            </div>
          </aside>
        </section>
        {property.floorplans?.length > 0 && (
          <section id="plantas" className="py-12">
            <SectionLabel>Plantas disponíveis</SectionLabel>
            <h2 className="serif mb-8 mt-3 text-3xl text-foreground">
              Escolha a sua planta
            </h2>
            <PropertyPlans property={property} />
          </section>
        )}
        {images.length > 0 && (
          <section className="py-12">
            <SectionLabel>Galeria do empreendimento</SectionLabel>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image: string, i: number) => (
                <button
                  key={image}
                  aria-label={`Abrir foto ${i + 1} de ${property.title}`}
                  onClick={() => {
                    setActiveImage(i);
                    setLightbox(true);
                  }}
                  className="overflow-hidden rounded-2xl"
                >
                  <img
                    src={image}
                    alt={`${property.title} — foto ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
        {property.pdfUrl && (
          <a
            className="inline-flex items-center gap-2 py-6 text-primary"
            href={property.pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Download size={18} />
            Material do empreendimento
          </a>
        )}
        {youtubeEmbed(property.youtube || "") && (
          <section className="py-12">
            <SectionLabel>Vídeo do empreendimento</SectionLabel>
            <iframe
              title={`Vídeo — ${property.title}`}
              className="mt-5 aspect-video w-full rounded-3xl"
              src={youtubeEmbed(property.youtube)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </section>
        )}
      </main>
      {lightbox && (
        <Lightbox
          images={images}
          active={activeImage}
          onClose={() => setLightbox(false)}
          onPrev={() =>
            setActiveImage((activeImage - 1 + images.length) % images.length)
          }
          onNext={() => setActiveImage((activeImage + 1) % images.length)}
        />
      )}
    </div>
  );
}
