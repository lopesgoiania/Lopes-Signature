import { Link } from 'wouter';
import { PublicNav, SectionLabel } from '@/components/signature-ui';

export default function AboutPage() {
  return <div className="signature-shell noise min-h-[100dvh] text-[#f5f2e9]"><PublicNav /><main className="mx-auto max-w-[1280px] px-5 pb-24 pt-40 md:px-10">
    <SectionLabel>Experiência Lopes</SectionLabel>
    <h1 className="serif text-5xl text-white md:text-7xl">Um olhar <em className="font-normal text-[#e8c766]">Signature.</em></h1>
    <p className="mt-8 max-w-3xl text-lg leading-8 text-[#c9c9c9]">A experiência da Lopes Goiânia encontra uma atuação dedicada aos imóveis de alto luxo. Conhecimento dos empreendimentos, atenção às particularidades de cada endereço e orientação próxima em cada etapa da escolha.</p>
    <section className="mt-20 grid gap-10 border-y border-white/10 py-16 md:grid-cols-2"><h2 className="serif text-4xl">Goiânia, sob um<br /><em className="font-normal text-[#e8c766]">olhar especializado.</em></h2><div className="space-y-5 text-base leading-8 text-[#c9c9c9]"><p>A Lopes Goiânia atua na compra e no aluguel de imóveis prontos e na planta, com atendimento personalizado. A Signature concentra esse olhar no alto luxo, aproximando quem procura um imóvel de profissionais que conhecem o mercado local.</p><p>Arquitetura, localização, espaços e acabamentos compõem a leitura de cada empreendimento. São esses detalhes, apresentados com clareza, que ajudam a reconhecer o imóvel à altura da sua exigência.</p></div></section>
    <section className="grid gap-8 py-16 md:grid-cols-3">{[['Transparência','Informações claras sobre os imóveis e suas particularidades, para que cada escolha seja bem orientada.'],['Excelência','Atenção aos detalhes do empreendimento e às necessidades de quem procura um imóvel.'],['Compromisso','Acompanhamento próximo ao longo da busca e das etapas da aquisição.']].map(([title,text])=><div key={title}><h2 className="serif text-3xl text-[#e8c766]">{title}</h2><p className="mt-4 text-sm leading-7 text-[#c9c9c9]">{text}</p></div>)}</section>
    <Link href="/especialistas" className="metal-button inline-block rounded-full px-7 py-4 text-sm font-bold">Conheça nossos especialistas</Link>
  </main></div>;
}