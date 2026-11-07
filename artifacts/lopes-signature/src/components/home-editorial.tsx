import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { useCreateLead } from "@workspace/api-client-react";
import { ResponsiveImage } from "./responsive-image";
import {
  propertyHref,
  propertyLocation,
  taxonomyHref,
  taxonomyMatches,
  type Taxonomy,
} from "@/lib/catalog";
import { postHref, type Post } from "@/lib/journal";

type Props = {
  properties: any[];
  taxonomies: Taxonomy[];
  posts: Post[];
  postsLoading: boolean;
  postsError: boolean;
  retryPosts: () => unknown;
};
const FAQ = [
  {
    q: "Como escolher entre os imóveis do catálogo?",
    a: "Compare área privativa, distribuição dos ambientes, localização e valor. Nas páginas dos imóveis, você encontra fotos, plantas e características cadastradas. Se precisar, a equipe ajuda a esclarecer as diferenças entre as opções.",
  },
  {
    q: "Posso conversar com alguém antes de escolher um imóvel?",
    a: "Sim. Informe no formulário o que você procura, os bairros de interesse e a faixa de valor. A equipe pode orientar sua busca a partir dessas informações e das opções disponíveis.",
  },
  {
    q: "Como agendar uma visita?",
    a: "Solicite atendimento na página do imóvel ou no formulário abaixo. A equipe entrará em contato para verificar a disponibilidade da unidade e combinar a visita.",
  },
  {
    q: "Os valores e as unidades estão garantidos?",
    a: "Valores, unidades e condições comerciais podem mudar. Antes de avançar, confirme a disponibilidade e a tabela vigente com o especialista responsável.",
  },
];

export function HomeEditorial({
  properties,
  taxonomies,
  posts,
  postsLoading,
  postsError,
  retryPosts,
}: Props) {
  const lead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);
  const highlight = properties.find(
    (p) => p.slug === "epic-city-home" || p.title === "Epic City Home",
  );
  const gallery: string[] = highlight?.gallery || [];
  const pool =
    gallery.find((src) => /-17-piscina\./i.test(src)) ||
    gallery.find((src) => /piscina/i.test(src));
  const neighborhoods = taxonomies
    .filter((t) => t.active && t.kind === "neighborhood")
    .map((t) => ({
      term: t,
      count: properties.filter((p) => taxonomyMatches(p, t, taxonomies)).length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lead.isPending || submitted) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    lead.mutate(
      {
        data: {
          name: String(fields.get("name") || "").trim(),
          email: String(fields.get("email") || "").trim(),
          phone: String(fields.get("phone") || "").trim(),
          propertyId: "",
          propertyTitle: "",
          status: "new",
          source: "pagina-contato",
          note: `Atendimento solicitado pela home Signature. Interesse: ${String(fields.get("interest") || "").trim()}`,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
        },
      },
    );
  }
  return (
    <>
      <div
        className="hp-benefit-strip"
        aria-label="O que consultar antes de escolher"
      >
        <a href="#como-escolher">
          Plantas e metragens <ArrowUpRight size={17} />
        </a>
        <a href={neighborhoods.length ? "#hp-bairros" : "/imoveis"}>
          Bairros e localização <ArrowUpRight size={17} />
        </a>
        <a href="#contato">
          Valores e disponibilidade <ArrowUpRight size={17} />
        </a>
      </div>
      <section
        className="hp-architecture hp-container hp-section"
        id="como-escolher"
      >
        <div className="hp-section-heading">
          <h2>
            A planta importa.
            <br />
            <em>O endereço também.</em>
          </h2>
          <p>
            O imóvel precisa fazer sentido para a sua rotina. Olhe para os
            espaços, mas também para o que existe ao redor.
          </p>
        </div>
        {highlight && (
          <div className="hp-image-story">
            <figure>
              <ResponsiveImage
                src={highlight.images?.[0]}
                alt={`Arquitetura do ${highlight.title}`}
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 65vw"
              />
              <figcaption>
                {highlight.title} · {propertyLocation(highlight)}
              </figcaption>
            </figure>
            <div className="hp-image-aside">
              {pool && (
                <figure>
                  <ResponsiveImage
                    src={pool}
                    alt={`Área da piscina do ${highlight.title}`}
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, 35vw"
                  />
                  <figcaption>Área de lazer · {highlight.title}</figcaption>
                </figure>
              )}
              <p>
                Veja as imagens e as características de cada projeto antes de
                conhecer de perto.
              </p>
              <Link href={propertyHref(highlight)} className="hp-text-link">
                Conhecer {highlight.title} <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
        )}
        <div className="hp-criteria">
          <div>
            <h3>Espaços para o seu dia</h3>
            <p>
              Compare a área privativa e a distribuição dos ambientes. A
              metragem é o começo; a planta ajuda a entender como morar.
            </p>
          </div>
          <div>
            <h3>Um bairro que faz sentido</h3>
            <p>
              Confira a localização e considere seus deslocamentos, os serviços
              próximos e a relação do imóvel com o entorno.
            </p>
          </div>
          <div>
            <h3>Condições bem entendidas</h3>
            <p>
              Consulte o valor de referência e confirme unidades,
              disponibilidade e condições de negociação com a equipe.
            </p>
          </div>
        </div>
      </section>
      <section id="manifesto" className="hp-guidance hp-section">
        <div className="hp-container hp-guidance-grid">
          <div>
            <h2>
              Da primeira busca
              <br />
              <em>à visita ao imóvel.</em>
            </h2>
            <p>
              Conte com a equipe Lopes Signature para esclarecer detalhes dos
              empreendimentos e organizar os próximos passos da sua escolha.
            </p>
            <Link href="/especialistas" className="hp-button hp-button-light">
              Conhecer os especialistas <ArrowRight size={20} />
            </Link>
          </div>
          <div className="hp-guidance-list">
            <article>
              <h3>Converse sobre o que procura.</h3>
              <p>
                Bairro, espaço, momento de vida e faixa de valor ajudam a
                direcionar a busca.
              </p>
            </article>
            <article>
              <h3>Entenda as opções.</h3>
              <p>
                Tire dúvidas sobre plantas, características dos projetos e
                condições comerciais.
              </p>
            </article>
            <article>
              <h3>Conheça de perto.</h3>
              <p>
                Solicite uma visita e confirme com a equipe os imóveis e
                horários disponíveis.
              </p>
            </article>
          </div>
        </div>
      </section>
      {neighborhoods.length > 0 && (
        <section
          id="hp-bairros"
          className="hp-neighborhoods hp-container hp-section"
        >
          <div className="hp-section-heading">
            <h2>
              Por onde você
              <br />
              <em>quer começar?</em>
            </h2>
            <p>
              Explore os bairros que têm imóveis no catálogo e encontre os
              endereços que fazem sentido para você.
            </p>
          </div>
          <div className="hp-neighborhood-list">
            {neighborhoods.map(({ term, count }) => (
              <Link href={taxonomyHref(term)} key={term.id}>
                <div>
                  <h3>{term.label}</h3>
                  <span>
                    {count}{" "}
                    {count === 1 ? "imóvel no catálogo" : "imóveis no catálogo"}
                  </span>
                </div>
                <ArrowUpRight size={28} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {(postsLoading || postsError || posts.length > 0) && (
        <section id="blog" className="hp-journal hp-container hp-section">
          <div className="hp-section-heading">
            <h2>
              Informação para
              <br />
              <em>escolher melhor.</em>
            </h2>
            <div>
              <p>
                Leituras do Journal Signature sobre arquitetura e mercado
                imobiliário.
              </p>
              <Link href="/journal" className="hp-text-link">
                Explorar o Journal <ArrowRight size={19} />
              </Link>
            </div>
          </div>
          {postsLoading ? (
            <p role="status">Carregando artigos…</p>
          ) : postsError ? (
            <p role="alert">
              Não foi possível carregar os artigos.{" "}
              <button onClick={retryPosts} className="hp-text-link">
                Tentar novamente
              </button>
            </p>
          ) : (
            <div className="hp-journal-grid">
              {posts.slice(0, 3).map((post) => (
                <Link href={postHref(post)} key={post.id}>
                  {post.image && (
                    <ResponsiveImage
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                    />
                  )}
                  <p>{post.category}</p>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <span className="hp-text-link">
                    Ler artigo <ArrowUpRight size={18} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
      <section id="contato" className="hp-contact hp-section">
        <div className="hp-container hp-contact-grid">
          <div className="hp-contact-copy">
            <h2>
              Conte o que
              <br />
              você procura.
              <br />
              <em>Vamos conversar.</em>
            </h2>
            <p>
              Deixe seu contato para falar sobre imóveis, bairros e
              possibilidades de visita com a equipe Signature.
            </p>
            <a href="tel:+556239219800" className="hp-contact-phone">
              (62) 3921-9800 <ArrowUpRight size={22} />
            </a>
            <p className="hp-contact-offices">
              Atendimento Lopes em Goiânia
              <br />
              Marista · Bueno · Jardim Goiás
            </p>
          </div>
          <div className="hp-contact-panel">
            {submitted ? (
              <div className="hp-contact-success" role="status">
                <Check size={38} />
                <h3>Contato recebido.</h3>
                <p>
                  A equipe recebeu sua solicitação e poderá falar com você pelos
                  canais informados.
                </p>
                <button
                  className="hp-text-link"
                  onClick={() => {
                    setSubmitted(false);
                    lead.reset();
                  }}
                >
                  Enviar outra solicitação <ArrowRight size={19} />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="form-home-contact">
                <h3>Fale com a Signature</h3>
                <p>Preencha seus dados e conte um pouco sobre sua busca.</p>
                <label htmlFor="home-contact-name">
                  Seu nome
                  <input
                    id="home-contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </label>
                <div className="hp-contact-fields">
                  <label htmlFor="home-contact-email">
                    E-mail
                    <input
                      id="home-contact-email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      required
                      maxLength={200}
                    />
                  </label>
                  <label htmlFor="home-contact-phone">
                    Telefone / WhatsApp
                    <input
                      id="home-contact-phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      inputMode="tel"
                      required
                      minLength={10}
                      maxLength={24}
                    />
                  </label>
                </div>
                <label htmlFor="home-contact-interest">
                  O que você procura? <span>(opcional)</span>
                  <textarea
                    id="home-contact-interest"
                    name="interest"
                    maxLength={1000}
                    rows={3}
                    placeholder="Bairros, tipo de imóvel, faixa de valor…"
                  />
                </label>
                <label className="hp-consent">
                  <input name="consent" type="checkbox" required />
                  <span>
                    Autorizo a Lopes Signature a entrar em contato sobre minha
                    busca pelos canais informados.
                  </span>
                </label>
                <button
                  type="submit"
                  className="hp-button hp-button-light"
                  disabled={lead.isPending}
                >
                  {lead.isPending
                    ? "Enviando solicitação…"
                    : "Solicitar atendimento"}
                  <ArrowRight size={20} />
                </button>
                {lead.isError && (
                  <p className="hp-form-error" role="alert">
                    Não foi possível enviar. Seus dados foram mantidos; tente
                    novamente ou ligue para a central.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
      <section id="hp-faq" className="hp-faq hp-container hp-section">
        <div>
          <h2>
            Antes de seguir,
            <br />
            <em>tire suas dúvidas.</em>
          </h2>
          <p>
            Precisa de uma informação específica?{" "}
            <a href="#contato">Converse com a equipe.</a>
          </p>
        </div>
        <div className="hp-faq-list">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <ChevronDown size={21} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
