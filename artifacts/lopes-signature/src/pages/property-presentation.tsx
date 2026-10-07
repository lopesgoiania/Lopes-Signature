import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "wouter";
import { useCreateLead } from "@workspace/api-client-react";
import { GooglePropertyMap } from "@/components/google-property-map";
import { Lightbox, money } from "@/components/signature-ui";
import { deliveryLabel, propertyLocation } from "@/lib/catalog";
import "./bauhaus-page.css";
import "./property-presentation.css";

function videoEmbed(url: string) {
  try {
    const u = new URL(url);
    if (!["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com"].includes(u.hostname)) return "";
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.split("/").pop();
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch { return ""; }
}

/** The Bauhaus editorial composition, populated exclusively from the catalog. */
export default function PropertyPresentation({ property: p }: { property: any }) {
  const photos = [...new Set<string>([...(p.images || []), ...(p.gallery || [])])];
  const plans: any[] = p.floorplans || [];
  const areas = [...new Set<number>(plans.map(f => Number(f.area)).filter(n => n > 0))].sort((a,b) => a-b);
  if (!areas.length && p.area > 0) areas.push(Number(p.area));
  const heroAreas = areas.length > 1 ? [areas[0], areas[areas.length-1]] : areas;
  const number = (n: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);
  const location = propertyLocation(p);
  const commercial = p.category === "Salas comerciais";
  const land = p.category === "Lotes";
  const specs = [
    [p.area > 0 ? `${number(p.area)} m²` : "", land ? "Área do lote" : "Área privativa"],
    ...(!commercial && !land ? [[p.bedrooms > 0 ? number(p.bedrooms) : "", "Quartos"], [p.suites > 0 ? number(p.suites) : "", "Suítes"]] : []),
    [p.bathrooms > 0 ? number(p.bathrooms) : "", "Banheiros"],
    [p.parking > 0 ? number(p.parking) : "", "Vagas"],
  ].filter(([value]) => value);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const planIndex = Math.min(selectedPlan, Math.max(0, plans.length-1));
  const plan = plans[planIndex];
  const [photo, setPhoto] = useState(0);
  const [zoom, setZoom] = useState<"gallery" | "plan" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dock, setDock] = useState(false);
  const uid = useId();
  const heroRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const createLead = useCreateLead();
  const video = videoEmbed(p.youtube || "");
  useEffect(() => {
    const observer = new IntersectionObserver(() => {
      const hero = heroRef.current?.getBoundingClientRect();
      const contact = contactRef.current?.getBoundingClientRect();
      setDock(Boolean(hero && contact && hero.bottom < 0 && contact.top > window.innerHeight));
    }, { threshold: [0, 0.1] });
    if (heroRef.current) observer.observe(heroRef.current);
    if (contactRef.current) observer.observe(contactRef.current);
    return () => observer.disconnect();
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createLead.isPending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    createLead.mutate({ data: {
      name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(), propertyId: p.id, propertyTitle: p.title,
      status: "new", source: "property-page",
      note: `Interesse: ${data.get("interest")}.${plan ? ` Planta consultada: ${plan.name || plan.title || `${plan.area} m²`}.` : ""}`,
    } }, { onSuccess: () => { setSubmitted(true); form.reset(); } });
  }
  return <div className="bauhaus-page editorial-property">
    <main>
      <section className="bh-hero" ref={heroRef} aria-labelledby={`${uid}-title`}>
        {photos[0] && <img className="bh-hero-photo" src={photos[0]} alt={p.title} fetchPriority="high" />}
        <div className="bh-hero-shade" aria-hidden="true" />
        <div className="bh-hero-top">
          <a className="bh-hero-brand" href="#projeto">{p.title}<span>{location}</span></a>
          <nav className="bh-hero-nav" aria-label={`Explore ${p.title}`}>
            <a href="#projeto">O projeto</a><a href="#localizacao">Localização</a>
            {plans.length > 0 && <a href="#plantas">Plantas</a>}
            {photos.length > 0 && <a href="#galeria">Galeria</a>}
            {video && <a href="#video">Vídeo</a>}
          </nav>
          <p className="bh-hero-presenter">Lopes Signature<span>Apresenta</span></p>
        </div>
        <div className="bh-hero-content">
          <h1 id={`${uid}-title`} aria-label={`${p.title}. ${heroAreas.map(a => `${a} metros quadrados`).join(" a ")}. ${location}.`}>
            {heroAreas.map(a => <span key={a} className="bh-hero-area" aria-hidden="true">{number(a)} <span>m².</span></span>)}
            <em className="bh-hero-desire" aria-hidden="true">{p.neighborhood || p.city}.</em>
          </h1>
          <p>{p.category} · {p.builder}<br />{p.condition}{deliveryLabel(p) ? ` · ${deliveryLabel(p)}` : ""}</p>
          <a className="bh-button" href="#atendimento">Conhecer o imóvel <ArrowUpRight size={19} /></a>
          <Link className="bh-catalog-back" href="/imoveis"><ArrowLeft size={15} /> Voltar ao catálogo</Link>
        </div>
      </section>
      <section className="bh-architecture bh-section" id="projeto">
        <div className="bh-section-heading">
          <h2>{p.title}<br /><em>{location}.</em></h2>
          <div><p className="bh-description">{p.description}</p><p className="bh-reference">Valor de referência<br /><strong>{p.price > 0 ? money(p.price) : "Sob consulta"}</strong></p></div>
        </div>
        <dl className="bh-property-specs">{specs.map(([value,label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {photos[1] && <figure className="bh-wide-photo"><button className="bh-image-button" onClick={() => { setPhoto(1); setZoom("gallery"); }} aria-label={`Ampliar foto de ${p.title}`}><img src={photos[1]} alt={`${p.title} — apresentação do empreendimento`} loading="lazy" /></button><figcaption>{p.title}<span>Imagem do empreendimento</span></figcaption></figure>}
        {photos[2] && <div className="bh-material-story">
          <figure><button className="bh-image-button" onClick={() => { setPhoto(2); setZoom("gallery"); }} aria-label={`Ampliar detalhe de ${p.title}`}><img src={photos[2]} alt={`${p.title} — detalhe do empreendimento`} loading="lazy" /></button><figcaption>{p.title} · {p.builder}</figcaption></figure>
          <div><h3>Conheça o empreendimento<br /><em>em cada detalhe.</em></h3>
            {(p.features || []).length > 0 && <ul className="bh-property-features">{p.features.map((f:string) => <li key={f}>{f}</li>)}</ul>}
            <a className="bh-text-link" href={plans.length ? "#plantas" : "#galeria"}>{plans.length ? "Explore as plantas" : "Explore as imagens"}<ArrowRight size={18} /></a>
          </div>
        </div>}
      </section>
      <section className="bh-neighborhood" id="localizacao">
        <div className="bh-neighborhood-copy"><h2>Um endereço.<br /><em>{location}.</em></h2><p>{p.address || location}</p>
          <a className="bh-text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.title,p.address,p.city,p.stateCode].filter(Boolean).join(", "))}`} target="_blank" rel="noreferrer">Ver localização no mapa<ArrowUpRight size={18}/></a>
          <GooglePropertyMap property={p} />
        </div>
        {photos[0] && <figure><button className="bh-image-button" onClick={() => { setPhoto(0); setZoom("gallery"); }} aria-label={`Ampliar fachada de ${p.title}`}><img src={photos[0]} alt={`${p.title} em ${location}`} loading="lazy" /></button><figcaption>{location}<span>Imagem do empreendimento</span></figcaption></figure>}
      </section>
      {photos.length > 0 && <section className="bh-leisure bh-section" id="galeria">
        <div className="bh-section-heading"><h2>O empreendimento.<br /><em>Outras perspectivas.</em></h2><p>Veja as imagens de {p.title}.</p></div>
        <figure className="bh-space-photo"><button className="bh-image-button" onClick={() => setZoom("gallery")} aria-label={`Ampliar foto ${photo+1} de ${p.title}`}><img src={photos[photo]} alt={`${p.title} — foto ${photo+1}`} loading="lazy" /></button><figcaption><div><h3>{p.title}</h3><p>{photo+1} de {photos.length} imagens</p></div><span>{p.builder}</span></figcaption></figure>
        <div className="bh-gallery-grid">{photos.map((src,i) => <button key={src} onClick={() => setPhoto(i)} aria-label={`Ver foto ${i+1} de ${p.title}`} aria-pressed={photo===i}><img src={src} alt={`${p.title} — miniatura ${i+1}`} loading="lazy" /></button>)}</div>
      </section>}
      {plans.length > 0 && <section className="bh-plans bh-section" id="plantas">
        <div className="bh-plan-copy"><h2>Qual espaço<br />combina com<br /><em>{commercial || land ? "o seu projeto?" : "a sua vida?"}</em></h2>
          <p>Conheça as plantas disponíveis de {p.title}.</p>
          <div className="bh-plan-controls" role="tablist" aria-label="Plantas disponíveis">
            {plans.map((f,i) => <button key={f.id || i} type="button" role="tab" id={`${uid}-tab-${i}`} aria-selected={planIndex===i} aria-controls={`${uid}-plan-panel`} tabIndex={planIndex===i ? 0 : -1}
              onClick={() => setSelectedPlan(i)} onKeyDown={e => { let next=i; if(e.key==="ArrowRight") next=(i+1)%plans.length; else if(e.key==="ArrowLeft") next=(i-1+plans.length)%plans.length; else if(e.key==="Home") next=0; else if(e.key==="End") next=plans.length-1; else return; e.preventDefault();setSelectedPlan(next);document.getElementById(`${uid}-tab-${next}`)?.focus(); }}>
              <span>{f.suites > 0 && !commercial && !land ? `${f.suites} suítes · ` : ""}</span>{number(Number(f.area))} <span>m²</span>{f.unit && <small className="bh-plan-unit">{f.unit}</small>}
            </button>)}
          </div>
          <p className="bh-fineprint">Consulte configuração, valores e disponibilidade com a equipe.</p>
          <a href="#atendimento" className="bh-text-link">Conversar sobre esta planta<ArrowRight size={18}/></a>
        </div>
        <figure className="bh-plan-image" role="tabpanel" id={`${uid}-plan-panel`} aria-labelledby={`${uid}-tab-${planIndex}`}>
          {plan.image && <button className="bh-image-button" onClick={() => setZoom("plan")} aria-label="Ampliar planta"><img src={plan.image} alt={`${plan.name || plan.title || `Planta de ${plan.area} m²`} — ${p.title}`} loading="lazy" /></button>}
          <figcaption><span>{plan.name || plan.title || `Planta de ${plan.area} m²`}</span>{plan.image && <button className="bh-text-link" onClick={() => setZoom("plan")}>Ampliar planta<ArrowUpRight size={16}/></button>}</figcaption>
          <div className="bh-plan-details">{plan.suites > 0 && !commercial && !land && <span>{plan.suites} suítes</span>}{plan.bathrooms > 0 && <span>{plan.bathrooms} banheiros</span>}{plan.parking > 0 && <span>{plan.parking} vagas</span>}<strong>{plan.price > 0 ? money(plan.price) : "Sob consulta"}</strong></div>
          {(plan.features || []).length > 0 && <ul className="bh-property-features">{plan.features.map((f:string) => <li key={f}>{f}</li>)}</ul>}
        </figure>
      </section>}
      {video && <section className="bh-section" id="video"><div className="bh-section-heading"><h2>{p.title}<br /><em>Em movimento.</em></h2></div><iframe className="bh-property-video" src={video} title={`Vídeo de ${p.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></section>}
      <section className="bh-contact bh-section" id="atendimento" ref={contactRef}>
        <div className="bh-contact-copy"><h2>Seu próximo capítulo<br /><em>pode começar aqui.</em></h2><p>Receba a apresentação de {p.title} e converse com a Lopes Signature sobre plantas, disponibilidade e possibilidades de visita.</p><div className="bh-signature">Lopes <strong>Signature</strong><span>Atendimento dedicado ao seu próximo endereço.</span></div></div>
        <div className="bh-form-wrap">{submitted ? <div className="bh-success" role="status"><Check size={30}/><h3>Seu interesse foi registrado.</h3><p>A equipe Lopes Signature recebeu seus dados para dar continuidade à conversa sobre {p.title}.</p><button className="bh-text-link" onClick={() => {setSubmitted(false);createLead.reset();}}>Enviar outra solicitação<ArrowRight size={18}/></button></div> : <form onSubmit={submit}>
          <label htmlFor={`${uid}-name`}>Seu nome<input id={`${uid}-name`} name="name" required autoComplete="name" placeholder="Como podemos chamar você?" /></label>
          <label htmlFor={`${uid}-phone`}>Telefone ou WhatsApp<input id={`${uid}-phone`} name="phone" type="tel" required minLength={10} autoComplete="tel" placeholder="(62) 99999-9999" /></label>
          <label htmlFor={`${uid}-email`}>E-mail<input id={`${uid}-email`} name="email" type="email" required autoComplete="email" placeholder="voce@email.com" /></label>
          <label htmlFor={`${uid}-interest`}>Como podemos ajudar?<select name="interest" id={`${uid}-interest`}><option>Receber a apresentação</option><option>Conhecer plantas e valores</option><option>Conversar sobre uma visita</option></select></label>
          <p className="bh-fineprint">Ao enviar, você solicita o contato da Lopes Signature sobre {p.title} pelos canais informados.</p>
          {createLead.isError && <p className="bh-error" role="alert">Não foi possível enviar. Seus dados foram mantidos; tente novamente em instantes.</p>}
          <button className="bh-button" type="submit" disabled={createLead.isPending}>{createLead.isPending ? "Enviando solicitação…" : "Receber atendimento"}<ArrowUpRight size={19}/></button>
        </form>}</div>
      </section>
    </main>
    <footer className="bh-footer"><p>{p.title} · {p.builder}</p><p>Apresentado por Lopes Signature</p><small>Imagens do empreendimento. Características, áreas, valores e disponibilidade devem ser confirmados com a equipe e nos documentos do empreendimento.</small><Link className="bh-text-link" href="/imoveis">Voltar ao catálogo<ArrowLeft size={16}/></Link></footer>
    {dock && <div className="bh-dock"><span>{p.title}<small>{location}</small></span><a href="#atendimento">Solicitar apresentação<ArrowUpRight size={17}/></a></div>}
    {zoom && <Lightbox images={zoom==="plan" ? [plan.image] : photos} active={zoom==="plan" ? 0 : photo} onClose={() => setZoom(null)} onNext={() => zoom==="gallery" && setPhoto((photo+1)%photos.length)} onPrev={() => zoom==="gallery" && setPhoto((photo-1+photos.length)%photos.length)}/ >}
  </div>;
}
