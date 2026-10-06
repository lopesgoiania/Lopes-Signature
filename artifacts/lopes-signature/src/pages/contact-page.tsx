import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateLead } from '@workspace/api-client-react';
import { PageLogo, PublicNav } from '@/components/signature-ui';

export default function ContactPage() {
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createLead.isPending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
    }, {
      onSuccess: () => { setSubmitted(true); formElement.reset(); },
    });
  }

  return (
    <div className="signature-shell contact-page min-h-[100dvh] text-foreground">
      <PublicNav />

      <main className="pt-28 md:pt-36">
        {/* Header da Página de Contato */}
        <section className="relative border-b border-border px-5 pb-16 pt-10 md:px-10 md:pb-12">
          <div className="mx-auto max-w-[1280px]">

            <h1 className="serif text-5xl leading-[1.08] text-foreground md:text-7xl">
              Inicie uma conversa <br />
              <em className="font-normal text-[#876526]">exclusiva com nosso time.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#59564e]">
              Seja para adquirir uma residência autoral, agendar uma visita privada ou disponibilizar o seu imóvel no portfólio restrito da Lopes Signature, nossos consultores estão à disposição.
            </p>
          </div>
        </section>

        {/* Seção Principal de Contato (Formulário + Informações) */}
        <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 md:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {/* Informações de Contato / Escritórios */}
            <div className="flex flex-col justify-between space-y-10">
              <div>
                <h2 className="serif text-3xl text-foreground md:text-4xl">
                  Canais de Atendimento <em className="font-normal text-[#876526]">VIP</em>
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#59564e]">
                  Nossa equipe de curadoria atende sob agendamento prévio com discrição e pontualidade.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d8bc7c]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#876526]">Telefone Central</p>
                      <a href="tel:+556239219800" className="mt-1 inline-flex min-h-11 items-center text-base font-semibold text-foreground hover:underline">(62) 3921 9800</a>
                      <p className="text-xs text-[#59564e]">Segunda a Sábado, das 08h às 20h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d8bc7c]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#876526]">E-mail Direct</p>
                      <a href="mailto:contato@lopessignature.com.br" className="mt-1 inline-flex min-h-11 items-center break-all text-sm font-semibold text-foreground hover:underline">contato@lopessignature.com.br</a>
                      <p className="text-xs text-[#59564e]">Resposta em até 2 horas úteis</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] text-[#d8bc7c]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="mono-label text-xs text-[#876526]">Nossos Escritórios</p>
                      <div className="mt-2 space-y-3 text-sm text-foreground">
                        <p>
                          <strong className="text-[#876526]">Lopes Marista:</strong><br />
                          R. 146, 495 - Marista, Goiânia - GO, 74170-090
                        </p>
                        <p>
                          <strong className="text-[#876526]">Lopes Bueno:</strong><br />
                          Avenida T-11 Qd. 117 Lt. 20 - Nº 503 - St. Bueno, Goiânia - GO, 74223-070
                        </p>
                        <p>
                          <strong className="text-[#876526]">Lopes Jardim Goiás:</strong><br />
                          R. 14, Térreo C-9 Lotes 02/05-15 - Jardim Goiás, Goiânia - GO, 74810-180
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card WhatsApp Instantâneo */}
              <div className="rounded-xl border border-[#d4af37]/40 bg-[#141414] p-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-[#e8c766]" />
                  <h3 className="serif text-xl text-white">Atendimento Imediato via WhatsApp</h3>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#bcb8af]">
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
            <div className="rounded-xl border border-white/10 bg-[#121212] p-6 md:p-10">
              <h2 className="serif text-3xl text-white">Enviar Mensagem Privada</h2>
              <p className="mt-2 text-xs text-[#bcb8af]">
                Preencha os campos abaixo para que nosso curador responsável entre em contato.
              </p>

              {submitted ? (
                <div role="status" className="mt-10 rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto text-[#e8c766]" />
                  <h3 className="serif mt-4 text-2xl text-white">Mensagem Recebida com Sucesso</h3>
                  <p className="mt-2 text-sm text-[#c9c9c9]">
                    Agradecemos o seu contato. Um consultor sênior da Lopes Signature retornará em breve.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); createLead.reset(); }}
                    className="mt-6 rounded-xl border border-white/20 px-6 py-2.5 text-xs text-white hover:border-[#d4af37] hover:text-[#e8c766]"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-2 block text-sm text-[#bcb8af]">Nome Completo *</label>
                      <input
                        id="contact-name" name="name" autoComplete="name"
                        required
                        placeholder="Seu nome completo"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-base text-white placeholder:text-[#aaa69e] outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-2 block text-sm text-[#bcb8af]">E-mail Corporativo / Pessoal *</label>
                      <input
                        id="contact-email" name="email" autoComplete="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-base text-white placeholder:text-[#aaa69e] outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="contact-phone" className="mb-2 block text-sm text-[#bcb8af]">Telefone / WhatsApp *</label>
                      <input
                        id="contact-phone" name="phone" type="tel" autoComplete="tel"
                        required
                        placeholder="(62) 99999-9999"
                        className="h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-base text-white placeholder:text-[#aaa69e] outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="mb-2 block text-sm text-[#bcb8af]">Assunto de Interesse</label>
                      <select
                        id="contact-subject" name="subject"
                        className="h-12 w-full rounded-xl border border-white/15 bg-[#141414] px-4 text-base text-white placeholder:text-[#aaa69e] outline-none focus:border-[#d4af37]"
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
                    <label htmlFor="contact-note" className="mb-2 block text-sm text-[#bcb8af]">Sua Mensagem ou Preferências</label>
                    <textarea
                      id="contact-note" name="note"
                      rows={5}
                      placeholder="Descreva detalhes como região desejada, perfil do imóvel ou melhor horário para contato..."
                      className="w-full rounded-xl border border-white/15 bg-black/40 p-4 text-base text-white placeholder:text-[#aaa69e] outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {createLead.isError && <p role="alert" className="text-sm leading-6 text-[#ffb4ab]">Não foi possível enviar sua mensagem. Seus dados foram mantidos. Tente novamente ou entre em contato por telefone.</p>}
                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="metal-button disabled:cursor-wait disabled:opacity-60 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold"
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

      <footer className="border-t border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1.5fr] md:px-10">
          <div>
            <PageLogo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#D0D0D0]">Casas, apartamentos e empreendimentos de alto padrão em Goiânia, com o olhar dos especialistas Lopes Signature.</p>
          </div>
          <div>
            <p className="mono-label mb-5 text-primary">Navegue</p>
            <div className="flex flex-col gap-3 text-sm text-[#D0D0D0]">
              <Link href="/imoveis" className="hover:text-primary">Imóveis</Link>
              <Link href="/empreendimentos" className="hover:text-primary">Empreendimentos</Link>
              <Link href="/especialistas" className="hover:text-primary">Especialistas</Link>
              <Link href="/conteudos" className="hover:text-primary">Conteúdos</Link>
              <Link href="/contato" className="hover:text-primary text-primary">Contato</Link>
            </div>
          </div>
          <div>
            <p className="mono-label mb-5 text-primary">Contato</p>
            <div className="text-sm text-[#D0D0D0] space-y-4">
              <p>
                <strong>Telefone:</strong> (62) 3921 9800<br />
                <strong>E-mail:</strong> contato@lopessignature.com.br
              </p>
              <div>
                <strong>Endereços:</strong>
                <ul className="mt-2 space-y-2 text-xs">
                  <li><span className="text-[#F7F5F0]">Lopes Marista:</span> R. 146, 495 - Marista, Goiânia - GO</li>
                  <li><span className="text-[#F7F5F0]">Lopes Bueno:</span> Avenida T-11 Qd. 117 Lt. 20 - Nº 503 - St. Bueno</li>
                  <li><span className="text-[#F7F5F0]">Lopes Jardim Goiás:</span> R. 14, Térreo C-9 Lotes 02/05-15 - Jardim Goiás</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
