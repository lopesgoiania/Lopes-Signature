import { PublicNav } from "@/components/signature-ui";

export default function PrivacyPage() {
  return (
    <div className="signature-shell bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-32 md:px-10">
        <h1 className="serif mb-6 text-4xl md:text-5xl">Política de Privacidade</h1>
        <p className="mb-8">
          Esta política descreve o tratamento de dados pessoais no site da Lopes
          Signature, operado por Goiânia Negócios Imobiliários, CNPJ
          19.246.027/0001-97.
        </p>
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="serif mb-3 text-2xl">Dados dos formulários</h2>
            <p>
              Quando você solicita atendimento, recebemos os dados preenchidos no
              formulário, como nome, e-mail, telefone e o imóvel de interesse.
              Usamos essas informações para responder à consulta, apresentar
              opções e organizar o atendimento e as visitas solicitadas.
              O pedido pode ser registrado no sistema de atendimento da Lopes.
            </p>
          </section>
          <section>
            <h2 className="serif mb-3 text-2xl">Navegação e medição</h2>
            <p>
              O endereço IP pode ser usado para sugerir o país e o DDI do
              telefone. Essa consulta ao IPAPI não inclui os dados do formulário.
              Quando a medição está ativa, ferramentas como Google Tag Manager,
              Pixel da Meta e API de Conversões podem receber dados de navegação
              e eventos para medir visitas e envios. A Meta pode receber
              dados de contato protegidos por hash para associar conversões.
              Os imóveis salvos no catálogo ficam no armazenamento do navegador.
            </p>
          </section>
          <section>
            <h2 className="serif mb-3 text-2xl">Compartilhamento e conservação</h2>
            <p>
              Serviços de hospedagem, atendimento e medição podem tratar
              dados para prestar essas funções. Os dados são conservados pelo
              tempo necessário ao atendimento e ao cumprimento das obrigações
              aplicáveis.
            </p>
          </section>
          <section>
            <h2 className="serif mb-3 text-2xl">Seus direitos e contato</h2>
            <p>
              Você pode solicitar confirmação de tratamento, acesso ou correção
              dos seus dados e exercer os demais direitos aplicáveis pela LGPD.
              Para dúvidas ou solicitações, escreva para{" "}
              <a className="underline" href="mailto:contato@lopessignature.com.br">
                contato@lopessignature.com.br
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
