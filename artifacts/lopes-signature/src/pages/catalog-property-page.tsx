import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { PublicNav, Lightbox, money } from "@/components/signature-ui";
import {
  catalogRequest,
  deliveryLabel,
  propertyLocation,
  propertyHref,
} from "@/lib/catalog";
function videoId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(u.hostname)
    )
      return u.searchParams.get("v") || u.pathname.split("/").pop();
  } catch {}
  return "";
}
export default function CatalogPropertyPage() {
  const { id } = useParams();
  const {
    data: p,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["catalog-property", id],
    queryFn: () => catalogRequest(`properties/${encodeURIComponent(id || "")}`),
  });
  const [tab, setTab] = useState("Visão geral");
  const [lightbox, setLightbox] = useState<{
    images: string[];
    active: number;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!p) return;
    const previous = document.title;
    document.title = p.seoTitle || `${p.title} | Imóveis Lopes Signature`;
    const nodes: HTMLElement[] = [];
    for (const [name, value] of [
      [
        "description",
        p.seoDescription ||
          `${p.title}: ${p.area} m², ${p.suites} suítes em ${propertyLocation(p)}.`,
      ],
      ["robots", p.indexable === false ? "noindex,follow" : "index,follow"],
    ]) {
      const el = document.createElement("meta");
      el.name = name;
      el.content = value;
      document.head.appendChild(el);
      nodes.push(el);
    }
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = window.location.origin + propertyHref(p);
    document.head.appendChild(canonical);
    nodes.push(canonical);
    return () => {
      document.title = previous;
      nodes.forEach((n) => n.remove());
    };
  }, [p]);
  const vid = videoId(p?.youtube || "");
  const images = [
    ...new Set<string>([...(p?.images || []), ...(p?.gallery || [])]),
  ];
  const tabs = [
    "Visão geral",
    ...(images.length ? ["Galeria"] : []),
    ...(p?.floorplans?.length ? ["Plantas"] : []),
    ...(/^[\w-]{11}$/.test(vid || "") ? ["Vídeo"] : []),
  ];
  return (
    <div className="signature-shell min-h-screen bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-32 md:px-10">
        <Link href="/imoveis" className="text-sm text-primary">
          ← Catálogo de imóveis
        </Link>
        {isLoading ? (
          <p className="py-20">Carregando imóvel…</p>
        ) : error ? (
          <p className="py-20">Não foi possível encontrar este imóvel.</p>
        ) : (
          p && (
            <>
              <div className="my-8 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="mono-label text-primary">Lopes Signature</p>
                  <h1 className="serif mt-3 text-4xl md:text-6xl">{p.title}</h1>
                  <p className="mt-3 text-muted-foreground">
                    {propertyLocation(p)}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {p.price > 0 ? money(p.price) : "Valor sob consulta"}
                  </p>
                  <p className="mt-2 text-sm">
                    {[p.condition, deliveryLabel(p)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              {images[0] && (
                <button
                  className="w-full"
                  onClick={() => setLightbox({ images, active: 0 })}
                >
                  <img
                    src={images[0]}
                    alt={p.title}
                    className="max-h-[560px] w-full rounded-3xl object-cover"
                  />
                </button>
              )}
              <div className="my-8 flex flex-wrap gap-6 border-y border-border py-5 text-sm">
                <span>{p.area} m²</span>
                <span>{p.suites} suítes</span>
                <span>{p.parking} vagas</span>
                {p.category && <span>{p.category}</span>}
              </div>
              <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
                <section>
                  <div
                    role="tablist"
                    aria-label="Informações do imóvel"
                    className="mb-8 flex flex-wrap gap-2"
                  >
                    {tabs.map((t) => (
                      <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`rounded-full border px-5 py-3 text-sm ${tab === t ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div role="tabpanel">
                    {tab === "Visão geral" && (
                      <>
                        <h2 className="serif mb-4 text-3xl">Sobre o imóvel</h2>
                        <p className="whitespace-pre-line leading-8 text-muted-foreground">
                          {p.description ||
                            "Conheça os detalhes deste imóvel com a equipe Lopes Signature."}
                        </p>
                        {p.features?.length > 0 && (
                          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                            {p.features.map((f: string) => (
                              <li key={f}>✓ {f}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                    {tab === "Galeria" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {images.map((img, i) => (
                          <button
                            key={img}
                            onClick={() => setLightbox({ images, active: i })}
                          >
                            <img
                              src={img}
                              alt={`${p.title} — imagem ${i + 1}`}
                              loading="lazy"
                              className="aspect-[4/3] w-full rounded-2xl object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {tab === "Plantas" && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        {p.floorplans.map((plan: any, i: number) => (
                          <article
                            key={i}
                            className="rounded-2xl border border-border bg-card p-4"
                          >
                            {plan.image && (
                              <button
                                className="w-full"
                                onClick={() =>
                                  setLightbox({
                                    images: [plan.image],
                                    active: 0,
                                  })
                                }
                              >
                                <img
                                  src={plan.image}
                                  alt={plan.title || `Planta ${i + 1}`}
                                  className="aspect-square w-full object-contain"
                                />
                              </button>
                            )}
                            <h3 className="serif mt-4 text-xl">
                              {plan.title || `Planta ${i + 1}`}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {[
                                plan.area && `${plan.area} m²`,
                                plan.suites && `${plan.suites} suítes`,
                                plan.parking && `${plan.parking} vagas`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {Number(plan.price) > 0 && (
                              <p className="mt-2 text-primary">
                                {money(Number(plan.price))}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                    {tab === "Vídeo" && (
                      <iframe
                        title={`Vídeo de ${p.title}`}
                        src={`https://www.youtube-nocookie.com/embed/${vid}`}
                        className="aspect-video w-full rounded-2xl"
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </section>
                <aside className="h-fit rounded-3xl border border-border bg-card p-6">
                  <h2 className="serif text-2xl">Fale com um especialista</h2>
                  <p className="my-3 text-sm text-muted-foreground">
                    Receba mais informações sobre {p.title}.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSending(true);
                      setMessage("");
                      const form = e.currentTarget;
                      const data = new FormData(form);
                      try {
                        await catalogRequest("leads", {
                          name: data.get("name"),
                          email: data.get("email"),
                          phone: data.get("phone"),
                          propertyId: p.id,
                        });
                        setMessage(
                          "Contato registrado. Nossa equipe falará com você.",
                        );
                        form.reset();
                      } catch (err) {
                        setMessage((err as Error).message);
                      } finally {
                        setSending(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <input
                      name="name"
                      required
                      placeholder="Seu nome"
                      aria-label="Seu nome"
                      className="w-full rounded-xl border bg-background p-3"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Seu e-mail"
                      aria-label="Seu e-mail"
                      className="w-full rounded-xl border bg-background p-3"
                    />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Telefone com DDD"
                      aria-label="Telefone"
                      className="w-full rounded-xl border bg-background p-3"
                    />
                    <button
                      disabled={sending}
                      className="metal-button w-full rounded-xl py-3 font-bold disabled:opacity-50"
                    >
                      {sending ? "Enviando…" : "Solicitar informações"}
                    </button>
                    <p role="status" className="text-sm">
                      {message}
                    </p>
                  </form>
                </aside>
              </div>
            </>
          )
        )}
      </main>
      {lightbox && (
        <Lightbox
          {...lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox({
              ...lightbox,
              active:
                (lightbox.active + lightbox.images.length - 1) %
                lightbox.images.length,
            })
          }
          onNext={() =>
            setLightbox({
              ...lightbox,
              active: (lightbox.active + 1) % lightbox.images.length,
            })
          }
        />
      )}
    </div>
  );
}
