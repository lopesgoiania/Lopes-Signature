import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, MapPin } from "lucide-react";
import { useCreateLead } from "@workspace/api-client-react";
import "./bauhaus-page.css";

const image = (id: string) => `/images/bauhaus/${id}.webp`;
const originalPlans = [
  { area: "398", file: "PLANTA 398M2.jpg", label: "Planta de 398 m²" },
  { area: "547", file: "PLANTA 547.jpg", label: "Planta de 547 m²" },
];
const leisure = [
  {
    id: "1690627",
    title: "Um intervalo ao ar livre.",
    text: "Água, luz e paisagismo em uma composição que convida a desacelerar.",
    alt: "Perspectiva da piscina externa do Bauhaus, com palmeiras e espreguiçadeiras",
  },
  {
    id: "1690614",
    title: "Movimento com outra perspectiva.",
    text: "Um espaço para cuidar de si, com a paisagem presente no treino.",
    alt: "Perspectiva da academia do Bauhaus, com amplas janelas",
  },
  {
    id: "1690616",
    title: "Bons encontros têm lugar.",
    text: "Ambientes de convivência que prolongam o prazer de receber.",
    alt: "Perspectiva do salão de festas do Bauhaus",
  },
  {
    id: "1690620",
    title: "Espaço para a imaginação.",
    text: "Texturas, cores e descobertas em um ambiente dedicado às crianças.",
    alt: "Perspectiva da brinquedoteca do Bauhaus",
  },
];

export default function BauhausPage({property}: {property?:any}) {
  const plans=property?.floorplans?.length?property.floorplans.map((p:any)=>({...p,label:p.title,image:p.image})):originalPlans.map(p=>({...p,image:`/images/bauhaus/${p.file}`,suites:undefined,parking:undefined,price:undefined}));
  const [plan, setPlan] = useState(0);
  const [space, setSpace] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const createLead = useCreateLead();

  useEffect(() => {
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = description?.content;
    if (description)
      description.content =
        "Conheça o Bauhaus, no Setor Bueno, junto ao Parque Vaca Brava. Arquitetura moderna brasileira, ambientes e plantas. Atendimento Lopes Signature.";
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "lp_view",
        pageUrl: window.location.pathname,
        propertyId: "bauhaus",
      }),
    }).catch(() => {});
    const previousTitle = document.title;
    document.title =
      "Bauhaus · Arquitetura para viver o Bueno | Lopes Signature";
    const observer = new IntersectionObserver(
      () => {
        const hero = heroRef.current?.getBoundingClientRect();
        const contact = contactRef.current?.getBoundingClientRect();
        setShowDock(
          Boolean(
            hero &&
            contact &&
            hero.bottom < 0 &&
            contact.top > window.innerHeight,
          ),
        );
      },
      { threshold: [0, 0.1] },
    );
    if (heroRef.current) observer.observe(heroRef.current);
    if (contactRef.current) observer.observe(contactRef.current);
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined)
        description.content = previousDescription;
      observer.disconnect();
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createLead.isPending) return;
    const element = event.currentTarget;
    const data = new FormData(element);
    createLead.mutate(
      {
        data: {
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          propertyId: "bauhaus",
          propertyTitle: "Bauhaus",
          status: "new",
          source: "lp-bauhaus",
          note: `Interesse: ${data.get("interest")}. Planta consultada: ${plans[plan].label}.`,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          element.reset();
        },
      },
    );
  }

  return (
    <div className="bauhaus-page">
      <main>
        <section
          className="bh-hero"
          ref={heroRef}
          aria-labelledby="bauhaus-title"
        >
          <img
            className="bh-hero-photo"
            src={image("1690586")}
            alt="Perspectiva artística do Bauhaus em frente ao lago e à vegetação do Parque Vaca Brava"
            fetchPriority="high"
          />
          <div className="bh-hero-shade" aria-hidden="true" />
          <div className="bh-hero-top">
            <a
              className="bh-hero-brand"
              href="#projeto"
              aria-label="Bauhaus Vaca Brava — o projeto"
            >
              Bauhaus<span>Vaca Brava</span>
            </a>
            <nav className="bh-hero-nav" aria-label="Explore o Bauhaus">
              <a href="#projeto">O projeto</a>
              <a href="#localizacao">Localização</a>
              <a href="#plantas">Plantas</a>
              <a href="#lazer">Lazer</a>
              <a href="#arquitetura">Arquitetura</a>
            </nav>
            <p className="bh-hero-presenter">
              Lopes Signature<span>Apresenta</span>
            </p>
          </div>
          <div className="bh-hero-content">
            <h1
              id="bauhaus-title"
              aria-label="398 metros quadrados. 547 metros quadrados. Em frente ao Vaca Brava."
            >
              <span className="bh-hero-area" aria-hidden="true">
                398 <span>m².</span>
              </span>
              <span className="bh-hero-area" aria-hidden="true">
                547 <span>m².</span>
              </span>
              <em className="bh-hero-desire" aria-hidden="true">
                Em frente
                <br />
                ao Vaca Brava.
              </em>
            </h1>
            <p>
              Duas residências extraordinárias em um endereço que não se repete.
              Arquitetura autoral, natureza e o melhor de Goiânia a poucos
              passos de casa.
            </p>
            <a className="bh-button" href="#atendimento">
              Conhecer o Bauhaus <ArrowUpRight size={19} />
            </a>
          </div>
        </section>

        <section className="bh-architecture bh-section" id="arquitetura">
          <div className="bh-section-heading" id="projeto">
            <h2>
              Brasileiro na essência.
              <br />
              <em>Autoral em cada linha.</em>
            </h2>
            <p>
              Concreto, madeira e vidro dão forma a uma arquitetura de volumes
              que desafiam a simetria. Luz e ventilação naturais fazem parte do
              desenho. Arte e mobiliário modernista completam a experiência.
            </p>
          </div>
          <figure className="bh-wide-photo">
            <img
              src={image("1690598")}
              alt="Perspectiva do living do Bauhaus, com madeira, mobiliário e ampla abertura para a paisagem"
              loading="lazy"
            />
            <figcaption>
              O living como extensão da paisagem.{" "}
              <span>Perspectiva artística do empreendimento</span>
            </figcaption>
          </figure>
          <div className="bh-material-story">
            <figure>
              <img
                src={image("1690590")}
                alt="Perspectiva de ambiente com painel de madeira, obra de arte e mobiliário modernista"
                loading="lazy"
              />
              <figcaption>Madeira, arte e formas que acolhem.</figcaption>
            </figure>
            <div>
              <h3>
                O modernismo encontra
                <br />o seu jeito de morar.
              </h3>
              <p>
                Mais do que uma referência estética, a união entre arte e função
                orienta os ambientes do Bauhaus. Uma colaboração entre Sousa
                Andrade e Humanae que celebra a arquitetura moderna brasileira.
              </p>
              <a className="bh-text-link" href="#plantas">
                Explore as plantas <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="bh-neighborhood" id="localizacao">
          <div className="bh-neighborhood-copy">
            <h2>
              O melhor do dia
              <br />
              começa <em>por perto.</em>
            </h2>
            <p>
              Uma caminhada no Vaca Brava. Uma pausa no café. O fim de tarde com
              a família no Goiânia Shopping. No Bueno, a vida ganha
              possibilidades além de casa.
            </p>
            <div className="bh-address">
              <MapPin size={20} />
              <div>
                Avenida T-3 com Avenida T-10<span>Setor Bueno · Goiânia</span>
              </div>
            </div>
            <a
              className="bh-text-link"
              href="https://www.google.com/maps/search/?api=1&query=Bauhaus+Sousa+Andrade+T3+T10+Goiania"
              target="_blank"
              rel="noreferrer"
            >
              Ver localização no mapa <ArrowUpRight size={18} />
            </a>
          </div>
          <figure>
            <img
              src={image("1690586")}
              alt="Perspectiva do Bauhaus visto do lago do Parque Vaca Brava"
              loading="lazy"
            />
            <figcaption>
              O Parque Vaca Brava faz parte desse cenário.{" "}
              <span>Perspectiva artística</span>
            </figcaption>
          </figure>
        </section>

        <section className="bh-leisure bh-section" id="lazer">
          <div className="bh-section-heading">
            <h2>
              Ficar também
              <br />
              <em>é um bom programa.</em>
            </h2>
            <p>
              O paisagismo inspirado no legado de Burle Marx aproxima o
              cotidiano da natureza. Piscinas, espaços de convivência e
              ambientes para diferentes momentos da família dão continuidade a
              essa experiência.
            </p>
          </div>
          <div
            className="bh-space-controls"
            role="group"
            aria-label="Escolha um ambiente"
          >
            <button
              type="button"
              aria-pressed={space === 0}
              onClick={() => setSpace(0)}
            >
              Piscina
            </button>
            <button
              type="button"
              aria-pressed={space === 1}
              onClick={() => setSpace(1)}
            >
              Academia
            </button>
            <button
              type="button"
              aria-pressed={space === 2}
              onClick={() => setSpace(2)}
            >
              Convivência
            </button>
            <button
              type="button"
              aria-pressed={space === 3}
              onClick={() => setSpace(3)}
            >
              Infância
            </button>
          </div>
          <figure className="bh-space-photo">
            <img
              src={image(leisure[space].id)}
              alt={leisure[space].alt}
              loading="lazy"
            />
            <figcaption>
              <div>
                <h3>{leisure[space].title}</h3>
                <p>{leisure[space].text}</p>
              </div>
              <span>Perspectiva artística</span>
            </figcaption>
          </figure>
        </section>

        <section className="bh-plans bh-section" id="plantas">
          <div className="bh-plan-copy">
            <h2>
              Qual espaço <br />
              combina com <br />
              <em>a sua vida?</em>
            </h2>
            <p>
              Conheça duas plantas do Bauhaus e imagine as possibilidades de
              cada ambiente.
            </p>
            <div
              className="bh-plan-controls"
              role="tablist"
              aria-label="Plantas disponíveis"
            >
              {plans.map((p:any, index:number) => (
                <button
                  key={p.area}
                  type="button"
                  role="tab"
                  aria-selected={plan === index}
                  aria-controls="bauhaus-plan-panel"
                  id={`bauhaus-plan-tab-${index}`}
                  onClick={() => setPlan(index)}
                >
                  <span>{p.suites ? `${p.suites} suítes · ` : ""}</span>{new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(Number(p.area))} <span>m²</span>
                </button>
              ))}
            </div>
            <p className="bh-fineprint">
              Áreas aproximadas conforme os materiais apresentados. Consulte
              outras tipologias, configuração e disponibilidade com a equipe.
            </p>
            <a href="#atendimento" className="bh-text-link">
              Conversar sobre esta planta <ArrowRight size={18} />
            </a>
          </div>
          <figure className="bh-plan-image" role="tabpanel" id="bauhaus-plan-panel" aria-labelledby={`bauhaus-plan-tab-${plan}`}>
            <img
              src={plans[plan].image}
              alt={`Planta humanizada do apartamento Bauhaus de aproximadamente ${plans[plan].area} metros quadrados`}
              loading="lazy"
            />
            <figcaption>
              <span>{plans[plan].label} · ilustração</span>
              <a
                href={plans[plan].image}
                target="_blank"
                rel="noreferrer"
              >
                Ampliar planta <ArrowUpRight size={16} />
              </a>
            </figcaption>
            <div className="bh-plan-details">{plans[plan].suites&&<span>{plans[plan].suites} suítes</span>}{plans[plan].parking&&<span>{plans[plan].parking} vagas</span>}{plans[plan].price>0&&<strong>{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(plans[plan].price)}</strong>}</div>
          </figure>
        </section>

        <section
          className="bh-contact bh-section"
          id="atendimento"
          ref={contactRef}
        >
          <div className="bh-contact-copy">
            <h2>
              Seu próximo capítulo
              <br />
              <em>pode começar aqui.</em>
            </h2>
            <p>
              Receba a apresentação do Bauhaus e converse com a Lopes Signature
              sobre plantas, disponibilidade e possibilidades de visita.
            </p>
            <div className="bh-signature">
              Lopes <strong>Signature</strong>
              <span>Atendimento dedicado ao seu próximo endereço.</span>
            </div>
          </div>
          <div className="bh-form-wrap">
            {submitted ? (
              <div className="bh-success" role="status">
                <Check size={30} />
                <h3>Seu interesse foi registrado.</h3>
                <p>
                  A equipe Lopes Signature recebeu seus dados para dar
                  continuidade à conversa sobre o Bauhaus.
                </p>
                <button
                  type="button"
                  className="bh-text-link"
                  onClick={() => {
                    setSubmitted(false);
                    createLead.reset();
                  }}
                >
                  Enviar outra solicitação <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label htmlFor="bh-name">
                  Seu nome
                  <input
                    id="bh-name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Como podemos chamar você?"
                  />
                </label>
                <label htmlFor="bh-phone">
                  Telefone ou WhatsApp
                  <input
                    id="bh-phone"
                    name="phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    minLength={10}
                    placeholder="(62) 99999-9999"
                  />
                </label>
                <label htmlFor="bh-email">
                  E-mail
                  <input
                    id="bh-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                  />
                </label>
                <label htmlFor="bh-interest">
                  Como podemos ajudar?
                  <select name="interest" id="bh-interest">
                    <option>Receber a apresentação</option>
                    <option>Conhecer plantas e valores</option>
                    <option>Conversar sobre uma visita</option>
                  </select>
                </label>
                <p className="bh-fineprint">
                  Ao enviar, você solicita o contato da Lopes Signature sobre o
                  Bauhaus pelos canais informados.
                </p>
                {createLead.isError && (
                  <p className="bh-error" role="alert">
                    Não foi possível enviar. Seus dados foram mantidos; tente
                    novamente em instantes.
                  </p>
                )}
                <button
                  className="bh-button"
                  type="submit"
                  disabled={createLead.isPending}
                >
                  {createLead.isPending
                    ? "Enviando solicitação…"
                    : "Receber atendimento"}
                  <ArrowUpRight size={19} />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <footer className="bh-footer">
        <p>Bauhaus · Sousa Andrade</p>
        <p>Apresentado por Lopes Signature</p>
        <small>
          Imagens ilustrativas e perspectivas artísticas do empreendimento.
          Mobiliário e decoração são sugestões. Características, áreas e
          disponibilidade devem ser confirmadas com a equipe e nos documentos do
          empreendimento.
        </small>
      </footer>
      {showDock && (
        <div className="bh-dock">
          <span>
            Bauhaus <small>Vaca Brava</small>
          </span>
          <a href="#atendimento">
            Solicitar apresentação <ArrowUpRight size={17} />
          </a>
        </div>
      )}
    </div>
  );
}
