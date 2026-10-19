import { Link } from "wouter";
import { PageLogo } from "@/components/signature-ui";
import "./site-footer.css";
export function SiteFooter() {
  return <footer className="signature-footer"><div className="signature-footer-grid">
    <div><PageLogo/><p>Imóveis de alto padrão em Goiânia. Encontre seu próximo endereço com a Lopes Signature.</p><a href="tel:+556239219800">(62) 3921-9800</a><a href="mailto:contato@lopessignature.com.br">contato@lopessignature.com.br</a></div>
    <nav aria-label="Navegação do rodapé"><h2>Explore</h2><Link href="/imoveis">Imóveis</Link><Link href="/sobre">Sobre nós</Link><Link href="/especialistas">Especialistas</Link><Link href="/journal">Journal</Link><Link href="/contato">Fale com a equipe</Link></nav>
    <div><h2>Nossas unidades</h2><p><strong>Marista</strong><br/>R. 146, 495 · Setor Marista</p><p><strong>Bueno</strong><br/>Av. T-11, 503 · Qd. 117, Lt. 20 · Setor Bueno</p><p><strong>Jardim Goiás</strong><br/>R. 14, térreo C-9, lotes 02/05-15 · Jardim Goiás</p></div>
  </div><div className="signature-footer-bottom"><span>Lopes Signature · Goiânia, GO</span><span>Valores e disponibilidade devem ser confirmados com a equipe.</span></div></footer>;
}
