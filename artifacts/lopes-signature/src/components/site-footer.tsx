export function SiteFooter() {
  const year = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format();

  return (
    <footer className="signature-footer">
      <div className="signature-footer-grid">
        <div>
          <a className="signature-footer-logo" href="/">
            <img src="/images/logo-signature.png" alt="Lopes Signature" width="140" height="52" loading="lazy" />
          </a>
          <p>Imóveis de alto padrão em Goiânia. Encontre seu próximo endereço com a Lopes Signature.</p>
          <a href="tel:+556239219800">(62) 3921-9800</a>
          <a href="mailto:contato@lopessignature.com.br">contato@lopessignature.com.br</a>
        </div>
        <nav aria-label="Navegação do rodapé">
          <h2>Explore</h2>
          <a href="/imoveis">Imóveis</a>
          <a href="/sobre">Sobre nós</a>
          <a href="/especialistas">Especialistas</a>
          <a href="/journal">Journal</a>
          <a href="/contato">Fale com a equipe</a>
        </nav>
        <div>
          <h2>Nossas unidades</h2>
          <p><strong>Marista</strong><br />R. 146, 495 · Setor Marista</p>
          <p><strong>Bueno</strong><br />Av. T-11, 503 · Qd. 117, Lt. 20 · Setor Bueno</p>
          <p><strong>Jardim Goiás</strong><br />R. 14, térreo C-9, lotes 02/05-15 · Jardim Goiás</p>
        </div>
      </div>
      <div className="signature-footer-bottom">
        <span>© <span data-signature-footer-year suppressHydrationWarning>{year}</span> Goiânia Negócios Imobiliários · CNPJ 19.246.027/0001-97 · CRECI CJ 30006</span>
        <a href="/politica-de-privacidade">Política de Privacidade</a>
      </div>
    </footer>
  );
}
