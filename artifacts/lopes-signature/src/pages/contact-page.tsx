import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, Calendar, CheckCircle2, Clock, Mail, MapPin, Phone, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateLead } from '@workspace/api-client-react';
import { PageLogo, PublicNav, SectionLabel } from '@/components/signature-ui';

export default function ContactPage() {
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const phone = String(form.get('phone') || '');
    const subject = String(form.get('subject') || 'Atendimento Privado');
    const note = String(form.get('note') || '');

    createLead.mutate({
      data: {
        name,
        email,
        phone,
        propertyId: '',
        propertyTitle: `Contato: ${subject}`,
        status: 'new',
        source: 'pagina-contato',
        note: `[Assunto: ${subject}] ${note}`,
      },
    });

    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <div className="signature-shell noise min-h-[100dvh] text-[#f5f2e9]">
      <PublicNav />

      <main className="pt-28 md:pt-36">
        {/* Header da Página de Contato */}
        <section className="relative border-b border-white/10 px-5 pb-16 pt-10 md:px-10 md:pb-20">
          <div className="mx-auto max-w-[1280px]">
            <SectionLabel>Atendimento Privado & Agendamento</SectionLabel>
            <h1 className="serif text-5xl leading-[.95] text-white md:text-7xl">
              Inicie uma conversa <br />
              <em className="font-normal text-[#e8c766]">exclusiva com nosso time.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#c9c9c9]">
              Seja para adquirir uma residência autoral, agendar uma visita privada ou disponibilizar o seu imóvel no portfólio restrito da Lopes Signature, nossos consultores estão à disposição.
            </p>
          </div>
        </section>

        {/* Seção Principal de Contato (Formulário + Informações) */}
        <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            {/* Informações de Contato / Escritórios */}
            <div className="flex flex-col justify-between space-y-10">
              <div>
                <h2 className="serif text-3xl text-white md:text-4xl">
                  Canais de Atendimento <em className="font-normal text-[#d4af37]">VIP</em>
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#9a9a9a]">
                  Nossa equipe de curadoria atende sob agendamento prévio com discrição e pontualidade.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d4af37]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#d4af37]">Telefone Central</p>
                      <p className="mt-1 text-base font-semibold text-white">+55 11 3081 4800</p>
                      <p className="text-xs text-[#7a7a7a]">Segunda a Sábado, das 08h às 20h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d4af37]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#d4af37]">E-mail Direct</p>
                      <p className="mt-1 text-base font-semibold text-white">curadoria@lopessignature.com.br</p>
                      <p className="text-xs text-[#7a7a7a]">Resposta em até 2 horas úteis</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d4af37]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#d4af37]">Escritórios Principais</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        • <strong>São Paulo:</strong> Av. Brig. Faria Lima, 3477 · Jardins<br />
                        • <strong>Goiânia:</strong> R. 146, Setor Marista · Goiânia, GO
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card WhatsApp Instantâneo */}
              <div className="rounded-3xl border border-[#d4af37]/40 bg-[#141414] p-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-[#e8c766]" />
                  <h3 className="serif text-xl text-white">Atendimento Imediato via WhatsApp</h3>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#9a9a9a]">
                  Conecte-se diretamente com um especialista de plantão para envio de portfólios confidenciais.
                </p>
                <a
                  href="https://wa.me/5511999991111?text=Olá,%20gostaria%20de%20iniciar%20um%20atendimento%20privado%20na%20Lopes%20Signature."
                  target="_blank"
                  rel="noreferrer"
                  className="metal-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold"
                >
                  Iniciar conversa agora <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Form de Mensagem / Agendamento */}
            <div className="rounded-3xl border border-white/10 bg-[#121212] p-8 md:p-12">
              <h2 className="serif text-3xl text-white">Enviar Mensagem Privada</h2>
              <p className="mt-2 text-xs text-[#9a9a9a]">
                Preencha os campos abaixo para que nosso curador responsável entre em contato.
              </p>

              {submitted ? (
                <div className="mt-10 rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto text-[#e8c766]" />
                  <h3 className="serif mt-4 text-2xl text-white">Mensagem Recebida com Sucesso</h3>
                  <p className="mt-2 text-sm text-[#c9c9c9]">
                    Agradecemos o seu contato. Um consultor sênior da Lopes Signature retornará em breve.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-xl border border-white/20 px-6 py-2.5 text-xs text-white hover:border-[#d4af37] hover:text-[#e8c766]"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mono-label mb-2 block text-xs text-[#9a9a9a]">Nome Completo *</label>
                      <input
                        name="name"
                        required
                        placeholder="Ex: Dr. Roberto Alencar"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="mono-label mb-2 block text-xs text-[#9a9a9a]">E-mail Corporativo / Pessoal *</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mono-label mb-2 block text-xs text-[#9a9a9a]">Telefone / WhatsApp *</label>
                      <input
                        name="phone"
                        required
                        placeholder="(11) 99999-9999"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="mono-label mb-2 block text-xs text-[#9a9a9a]">Assunto de Interesse</label>
                      <select
                        name="subject"
                        className="h-12 w-full rounded-xl border border-white/15 bg-[#141414] px-4 text-sm text-white outline-none focus:border-[#d4af37]"
                      >
                        <option value="Comprar Imóvel">Comprar Imóvel de Luxo</option>
                        <option value="Agendar Visita">Agendar Visita Privada</option>
                        <option value="Disponibilizar Imóvel">Disponibilizar meu Imóvel no Portfólio</option>
                        <option value="Investimentos">Investimento / Estruturação Patrimonial</option>
                        <option value="Outros">Outros Assuntos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mono-label mb-2 block text-xs text-[#9a9a9a]">Sua Mensagem ou Preferências</label>
                    <textarea
                      name="note"
                      rows={5}
                      placeholder="Descreva detalhes como região desejada, perfil do imóvel ou melhor horário para contato..."
                      className="w-full rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="metal-button flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold"
                  >
                    <Send size={16} />
                    {createLead.isPending ? 'Enviando mensagem...' : 'Enviar mensagem para a curadoria'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#070707]">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
          <div>
            <PageLogo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#7a7a7a]">
              Uma nova forma de encontrar lugares à altura da sua história.
            </p>
          </div>
          <div>
            <p className="mono-label mb-5 text-[#d4af37]">Navegue</p>
            <div className="flex flex-col gap-3 text-sm text-[#9a9a9a]">
              <Link href="/">Início</Link>
              <a href="/#catalogo">Imóveis</a>
              <Link href="/especialistas">Especialistas</Link>
              <a href="/#blog">Notícias</a>
              <Link href="/contato" className="text-[#e8c766]">Contato</Link>
            </div>
          </div>
          <div>
            <p className="mono-label mb-5 text-[#d4af37]">Contato</p>
            <p className="text-sm text-[#9a9a9a]">
              +55 11 3081 4800<br />
              curadoria@lopessignature.com.br<br />
              São Paulo · Goiânia · Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
