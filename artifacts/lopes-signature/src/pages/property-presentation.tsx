import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Bookmark, ChevronLeft, ChevronRight, Images, MapPin, Maximize2, Ruler, BedDouble, CarFront, Waves, Dumbbell, Flower2, Flame, Laptop, Package, CircleCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { catalogRequest, deliveryLabel, propertyLocation } from "@/lib/catalog";
import { Lightbox, money } from "@/components/signature-ui";
import { getFeatureIcon } from "@/lib/feature-icons";
import { useCreateLead } from "@workspace/api-client-react";
import { GooglePropertyMap } from "@/components/google-property-map";
import "./property-design-preview.css";

export default function PropertyDesignPreview() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useQuery({queryKey:["property-design-preview", id], queryFn:()=>catalogRequest(`properties/${encodeURIComponent(id || "")}`)});
  if (isLoading) return <div className="sp-preview sp-loading">Carregando a prévia do imóvel…</div>;
  if (error || !data) return <div className="sp-preview sp-loading"><p>Não foi possível carregar o imóvel.</p><button onClick={()=>refetch()}>Tentar novamente</button></div>;
  return <Presentation property={data} preview/>;
}

export function Presentation({property:p,preview=false}:{property:any;preview?:boolean}) {
  const photos = [...new Set<string>([...(p.images||[]),...(p.gallery||[])])].map(src=>src.startsWith("/")?`https://lopessignature.vercel.app${src}`:src);
  const taxonomy = useQuery<any[]>({queryKey:["taxonomies"],queryFn:()=>catalogRequest("taxonomies")});
  const createLead=useCreateLead();
  const [submitted,setSubmitted]=useState(false);
  const plans:any[] = p.floorplans||[];
  const [selected,setSelected] = useState(0);
  const isBSide = /b.?\s?side/i.test(p.title);
  const [photo,setPhoto] = useState(isBSide && photos.length > 8 ? 8 : 0);
  const [zoom,setZoom] = useState<"photos"|"plan"|null>(null);
  const [saved,setSaved] = useState(()=>{try{return JSON.parse(localStorage.getItem("signature-saved")||"[]").includes(p.id);}catch{return false;}});
  const plan=plans[selected];
  const uid=useId();
  const featureDefinitions = [
    {label:"Academia premium",icon:Dumbbell,match:/academia premium/i},
    {label:"Sky pool",icon:Waves,match:/sky pool/i},
    {label:"Spa",icon:Flower2,match:/\bspa\b/i},
    {label:"Ecosauna",icon:Flame,match:/ecosauna/i},
    {label:"Coworking",icon:Laptop,match:/coworking/i},
    {label:"Smart lockers",icon:Package,match:/smart lockers/i},
  ];
  const boundTerms=(taxonomy.data||[]).filter(t=>t.kind==="feature" && t.meta?.scope==="condominium" && (p.features||[]).includes(t.label));
  const condominium = boundTerms.length ? boundTerms.map(t=>({label:t.label,icon:getFeatureIcon(t.meta?.icon)})) : preview ? featureDefinitions.filter(f=>f.match.test(p.description||"")) : [];
  const amenitiesImage=p.condominiumImage || (isBSide && condominium.some(f=>/sky pool/i.test(f.label)) && photos.length>8 ? photos[8] : undefined);
  function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();if(preview||createLead.isPending)return;
    const form=e.currentTarget;const data=new FormData(form);
    createLead.mutate({data:{name:String(data.get("name")||"").trim(),email:String(data.get("email")||"").trim(),phone:String(data.get("phone")||"").trim(),propertyId:p.id,propertyTitle:p.title,status:"new",source:"property-page",note:plan ? `Planta consultada: ${plan.area} m²; unidade ${plan.unit||"não informada"}.` : "Solicitação de apresentação."}},{onSuccess:()=>{setSubmitted(true);form.reset();}});
  }
  const complementaryPhotos = isBSide ? [5,1].filter(i=>i<photos.length) : [1,2].filter(i=>i<photos.length);
  useEffect(()=>{const old=document.title;if(preview)document.title=`Prévia — ${p.title} | Signature`;return()=>{document.title=old};},[p.title]);
  const specs=[{icon:Ruler,value:`${p.area} m²`,label:"Área privativa"},...(p.suites>0?[{icon:BedDouble,value:`${p.suites} suítes`,label:"Configuração"}]:[]),...(p.parking>0?[{icon:CarFront,value:`${p.parking} ${p.parking===1?"vaga":"vagas"}`,label:"Garagem"}]:[])];
  let video="";try{const u=new URL(p.youtube||"");if(["youtu.be","youtube.com","www.youtube.com","m.youtube.com"].includes(u.hostname)){const id=u.hostname==="youtu.be"?u.pathname.slice(1):u.searchParams.get("v")||u.pathname.split("/").pop();if(id&&/^[\w-]{11}$/.test(id))video=`https://www.youtube-nocookie.com/embed/${id}`;}}catch{}
  const map=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.title,p.address,p.city,p.stateCode].filter(Boolean).join(", "))}`;
  return <div className="sp-preview">
    {preview&&<div className="sp-preview-note">Prévia de design <span>•</span> Dados do catálogo atual</div>}
    <header className="sp-header"><a href="/" aria-label="Lopes Signature — início"><img src="/images/logo-signature.png" alt="Lopes Signature"/></a><nav aria-label="Navegação do imóvel">{photos.length>0&&<a href="#galeria">Galeria</a>}{condominium.length>0&&<a href="#condominio">Condomínio</a>}{plans.length>0&&<a href="#plantas">Plantas</a>}<a href="#detalhes">O empreendimento</a><a href="#localizacao">Localização</a></nav><a className="sp-header-contact" href="#atendimento">Falar com um especialista <ArrowUpRight size={16}/></a></header>
    <main>
      <div className="sp-utility sp-container"><a href="/imoveis"><ArrowLeft size={15}/> Voltar ao catálogo</a><button onClick={()=>{const next=!saved;setSaved(next);try{const ids=JSON.parse(localStorage.getItem("signature-saved")||"[]");localStorage.setItem("signature-saved",JSON.stringify(next?[...new Set([...ids,p.id])]:ids.filter((id:string)=>id!==p.id)));}catch{}}} aria-pressed={saved}><Bookmark size={16} fill={saved?"currentColor":"none"}/>{saved?"Salvo":"Salvar imóvel"}</button></div>
      <section className="sp-hero sp-container" aria-labelledby="sp-title">
        <div className="sp-hero-photo"><img onLoad={e=>e.currentTarget.parentElement?.style.setProperty("--photo-ratio",`${e.currentTarget.naturalWidth}/${e.currentTarget.naturalHeight}`)} src={photos[0]} alt={`Fachada do ${p.title}`} fetchPriority="high"/><button className="sp-photo-action" onClick={()=>{setPhoto(0);setZoom("photos")}}><Images size={17}/> Ver todas as {photos.length} fotos</button></div>
        <div className="sp-hero-copy"><div className="sp-status"><span>{p.condition}</span><span>{deliveryLabel(p)}</span></div><h1 id="sp-title">{p.title}</h1><p className="sp-location"><MapPin size={16}/>{propertyLocation(p)}</p><dl className="sp-specs">{specs.map(s=><div key={s.label}><dt><s.icon size={19}/>{s.label}</dt><dd>{s.value}</dd></div>)}</dl><div className="sp-price"><span>Unidade apresentada · {plans[0]?.unit || "Consulte disponibilidade"}</span><strong>{p.price>0?money(p.price):"Sob consulta"}</strong></div><a className="sp-primary" href="#atendimento">Falar com um especialista <ArrowUpRight size={19}/></a><p className="sp-unit-context">Configuração e valor da unidade apresentada. Conheça as opções disponíveis nas plantas.</p><a className="sp-inline" href="#plantas">Conhecer as plantas <ChevronRight size={16}/></a></div>
      </section>
      {photos.length>0&&<section className="sp-gallery sp-container sp-section" id="galeria"><div className="sp-section-title"><h2>O empreendimento <em>em imagens.</em></h2><div className="sp-gallery-controls"><span>{photo+1} / {photos.length}</span><button aria-label="Foto anterior" onClick={()=>setPhoto((photo-1+photos.length)%photos.length)}><ChevronLeft size={20}/></button><button aria-label="Próxima foto" onClick={()=>setPhoto((photo+1)%photos.length)}><ChevronRight size={20}/></button></div></div><div className="sp-gallery-layout"><button className="sp-gallery-main" onClick={()=>setZoom("photos")} aria-label="Ampliar imagem selecionada"><img src={photos[photo]} alt={`${p.title} — imagem ${photo+1}`} loading="lazy"/><span><Maximize2 size={18}/> Ampliar</span></button><div className="sp-gallery-side">{complementaryPhotos.map((i)=><button key={photos[i]} onClick={()=>{setPhoto(i);setZoom("photos")}} aria-label={`Ampliar imagem ${i+1}`}><img src={photos[i]} alt={`${p.title} — imagem ${i+1}`} loading="lazy"/></button>)}</div></div><div className="sp-gallery-bottom"><p>Imagens do empreendimento</p><button className="sp-inline" onClick={()=>setZoom("photos")}>Explorar a galeria completa <ArrowUpRight size={17}/></button></div></section>}
      {condominium.length>0&&<section className="sp-amenities sp-container sp-section" id="condominio">
        <div className="sp-amenities-layout">
          {amenitiesImage&&<figure className="sp-amenities-photo"><button onClick={()=>{setPhoto(Math.max(0,photos.indexOf(amenitiesImage)));setZoom("photos")}} aria-label="Ampliar foto do condomínio"><img src={amenitiesImage} alt={`Condomínio do ${p.title}`} loading="lazy"/></button><figcaption>{p.title} · Condomínio</figcaption></figure>}
          <div className="sp-amenities-copy"><h2>Características<br/><em>do condomínio.</em></h2><ul className="sp-amenities-list">{condominium.slice(0,4).map(f=><li key={f.label}><f.icon size={25} strokeWidth={1.4}/><span>{f.label}</span></li>)}</ul>
            <Dialog><DialogTrigger asChild><button className="sp-all-features">Ver todas as características <span>{condominium.length}</span><ArrowUpRight size={18}/></button></DialogTrigger><DialogContent className="sp-feature-modal"><DialogTitle>Características do condomínio</DialogTitle><DialogDescription>{p.title} · {propertyLocation(p)}</DialogDescription><ul className="sp-modal-features">{condominium.map(f=><li key={f.label}><f.icon size={27} strokeWidth={1.4}/><span>{f.label}</span></li>)}</ul><p className="sp-modal-note">Características informadas na apresentação do empreendimento. Consulte detalhes e disponibilidade com a equipe.</p></DialogContent></Dialog>
          </div>
        </div>
      </section>}
      {plan&&<section className="sp-plan-section sp-section" id="plantas"><div className="sp-container"><div className="sp-section-title"><h2>Encontre <em>a sua planta.</em></h2><p>Conheça as plantas disponíveis de {p.title}.</p></div><div className="sp-plan-tabs" role="tablist" aria-label="Plantas disponíveis">{plans.map((f,i)=><button key={f.id||i} role="tab" id={`${uid}-tab-${i}`} aria-controls={`${uid}-panel`} aria-selected={selected===i} tabIndex={selected===i?0:-1} onClick={()=>setSelected(i)} onKeyDown={e=>{let n=i;if(e.key==="ArrowRight")n=(i+1)%plans.length;else if(e.key==="ArrowLeft")n=(i-1+plans.length)%plans.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=plans.length-1;else return;e.preventDefault();setSelected(n);document.getElementById(`${uid}-tab-${n}`)?.focus();}}>{f.area} m²{f.suites>0&&<span>{f.suites} suítes</span>}</button>)}</div><div className="sp-plan-panel" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${selected}`}><button className="sp-plan-image" onClick={()=>setZoom("plan")} aria-label="Ampliar planta"><img src={plan.image?.startsWith("/")?`https://lopessignature.vercel.app${plan.image}`:plan.image} alt={`Planta de ${plan.area} m² — ${p.title}`} loading="lazy"/><span><Maximize2 size={17}/> Ampliar planta</span></button><div className="sp-plan-summary"><h3>{plan.area} m²</h3><p>{plan.suites>0?`${plan.suites} suítes` : p.category}{plan.unit?` · Unidade ${plan.unit}`:""}</p><dl>{plan.bathrooms>0&&<div><dt>Banheiros</dt><dd>{plan.bathrooms}</dd></div>}{plan.parking>0&&<div><dt>Vagas</dt><dd>{plan.parking}</dd></div>}<div><dt>Valor de referência</dt><dd className="sp-plan-price">{plan.price>0?money(plan.price):"Sob consulta"}</dd></div></dl><a className="sp-primary" href="#atendimento">Conversar sobre esta planta <ArrowUpRight size={17}/></a>{(plan.features||[]).length>0&&<ul>{plan.features.map((f:string)=><li key={f}>{f}</li>)}</ul>}<small>Consulte configuração, valores e disponibilidade com a equipe.</small></div></div></div></section>}
      <section className="sp-details sp-container sp-section" id="detalhes"><h2>Sobre <em>o empreendimento.</em></h2><div><p>{p.description}</p>{(p.features||[]).filter((f:string)=>!boundTerms.some(t=>t.label===f)).length>0&&<ul>{(p.features||[]).filter((f:string)=>!boundTerms.some(t=>t.label===f)).map((f:string)=><li key={f}>{f}</li>)}</ul>}</div></section>
      <section className="sp-location-section sp-container sp-section" id="localizacao"><div><h2>Seu endereço <em>em Goiânia.</em></h2><p>{propertyLocation(p)}</p><p>{p.address}</p><a className="sp-inline" href={map} target="_blank" rel="noreferrer">Ver localização no mapa <ArrowUpRight size={17}/></a></div><div className="sp-address"><MapPin size={38}/><strong>{p.neighborhood}</strong><span>{p.city} · {p.stateCode||"GO"}</span><GooglePropertyMap property={p}/></div></section>
      {video&&<section className="sp-container sp-section" id="video"><h2>O empreendimento <em>em movimento.</em></h2><iframe style={{width:"100%",aspectRatio:"16/9",border:0,marginTop:30,borderRadius:14}} src={video} title={`Vídeo de ${p.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></section>}
      <section className="sp-contact sp-section" id="atendimento"><div className="sp-container sp-contact-grid"><div><h2>Seu próximo capítulo<br/><em>pode começar aqui.</em></h2><p>Receba a apresentação de {p.title} e converse com a Lopes Signature sobre plantas, disponibilidade e possibilidades de visita.</p></div><form onSubmit={submit}><label>Seu nome<input name="name" required autoComplete="name" placeholder="Como podemos chamar você?"/></label><label>Telefone ou WhatsApp<input name="phone" required minLength={10} type="tel" autoComplete="tel" placeholder="(62) 99999-9999"/></label><label>E-mail<input name="email" required type="email" autoComplete="email" placeholder="voce@email.com"/></label>{submitted?<p role="status">Seu interesse foi registrado. A equipe dará continuidade ao atendimento.</p>:<button className="sp-primary" disabled={preview||createLead.isPending}>{createLead.isPending?"Enviando…":"Receber atendimento"}<ArrowUpRight size={18}/></button>}{createLead.isError&&<p role="alert">Não foi possível enviar. Seus dados foram mantidos; tente novamente.</p>}<small>{preview?"Formulário demonstrativo. Esta prévia não envia dados.":"Ao enviar, você solicita o contato da Lopes Signature pelos canais informados."}</small></form></div></section>
    </main><footer className="sp-footer sp-container"><img src="/images/logo-signature.png" alt="Lopes Signature"/><p>Características, áreas, valores e disponibilidade devem ser confirmados com a equipe.</p><a href="#sp-title">Voltar ao início</a></footer>
    {zoom&&<Lightbox images={zoom==="plan"?[plan.image?.startsWith("/")?`https://lopessignature.vercel.app${plan.image}`:plan.image]:photos} active={zoom==="plan"?0:photo} onClose={()=>setZoom(null)} onNext={()=>zoom==="photos"&&setPhoto((photo+1)%photos.length)} onPrev={()=>zoom==="photos"&&setPhoto((photo-1+photos.length)%photos.length)}/>}
  </div>;
}