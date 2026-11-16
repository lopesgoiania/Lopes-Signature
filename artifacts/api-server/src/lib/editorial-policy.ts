export const signatureCategories = [
  "Arquitetura & Design",
  "Goiânia & Endereços",
  "Mercado & Patrimônio",
  "Lifestyle & Experiências",
  "Imóveis & Curadoria",
] as const;
export function editorialPlan(posts: any[], day: string, requested?: string) {
  const date = new Date(`${day}T12:00:00-03:00`);
  const weekday = date.getUTCDay();
  const group =
    weekday === 1
      ? [signatureCategories[0], signatureCategories[3]]
      : weekday === 3
        ? [signatureCategories[2]]
        : [signatureCategories[1], signatureCategories[4]];
  const counts = Object.fromEntries(
    signatureCategories.map((c) => [
      c,
      posts.slice(0, 15).filter((p) => p.category === c).length,
    ]),
  );
  const categories =
    requested && signatureCategories.includes(requested as any)
      ? [requested]
      : [...group].sort((a, b) => counts[a] - counts[b]);
  return {
    cadence: "Segundas, quartas e sextas, às 9h de Brasília",
    categories,
    counts,
    purpose:
      weekday === 1
        ? "Repertório de arquitetura e experiência de morar"
        : weekday === 3
          ? "Inteligência patrimonial educativa"
          : "Conhecimento local e critérios de aquisição",
  };
}
export function humanReviewReasons(
  article: { title?: string; content?: string; summary?: string },
  verdict: any = {},
) {
  const reasons: string[] = [];
  if (
    /\b(itcd|itbi|iptu|jurídic\w*|tribut\w*|imposto\w*|alíquota\w*|sucessóri\w*|herança\w*|inventário\w*|isenç\w*|financiamento\w*|rentabilidade|retorno financeiro|recomendação de investimento)\b/iu.test(
      `${article.title} ${article.summary || ""} ${article.content}`,
    )
  )
    reasons.push(
      "Conteúdo jurídico, tributário ou financeiro exige revisão humana especializada.",
    );
  if (verdict.requiresHumanReview === true)
    reasons.push(
      String(
        verdict.riskReason || "Revisão especializada solicitada pelo editor.",
      ),
    );
  return [...new Set(reasons)];
}
export const premiumEditorialPolicy = `SIGNATURE JOURNAL — Arquitetura. Patrimônio. A arte de viver bem.
Somos uma revista digital de alto padrão em Goiânia, não um boletim de normas nem um gerador de notícias. Luxo se comunica pela curadoria, precisão e qualidade da narrativa, sem superlativos.
CINCO EDITORIAS: ${signatureCategories.join("; ")}.
PLANEJAMENTO: três artigos por semana: arquitetura/lifestyle; patrimônio/mercado; Goiânia/endereços/curadoria. Analise os últimos 100 títulos, resumos e ângulos, evitando repetição semântica mesmo quando as palavras mudarem. Pautas atemporais bem apuradas são preferíveis a notícias sem relevância real. Nunca publique apenas para cumprir cota.
ABORDAGEM: explique por que interessa a compradores/proprietários de alto padrão, qual a utilidade, a tese central e o diferencial em relação a conteúdo genérico. Não invente entrevistas ou especialistas consultados. A experiência de morar precede a burocracia.
TÍTULOS: proponha três alternativas elegantes e específicas, avalie clareza e busca, escolha uma. Evite títulos longos, siglas, números de leis, jargão, clickbait e promessas. Use a metadescrição para detalhes técnicos que pesariam no título.
REDAÇÃO: abertura concreta sem inventar uma cena observada pelo repórter; narrativa envolvente, informações verificáveis, exemplos identificados como exemplos e subtítulos claros. Não force Goiânia em assuntos universais nem invente características locais. Conclusão útil, sem slogan ou convite genérico. Profundidade não significa comprimento artificial.
GOVERNANÇA: assuntos jurídicos, tributários, sucessórios ou afirmações financeiras sensíveis devem ir para rascunho com revisão humana especializada, mesmo se fontes oficiais e a IA aprovarem. Nenhuma IA se apresenta como essa revisão humana.
DIREÇÃO DE ARTE: fotografia arquitetônica profissional, composição limpa, luz natural, cores neutras e quentes, materialidade, profundidade e enquadramento horizontal. REJEITE martelo, chaves, miniatura de casa, contratos, dinheiro, mapa técnico, imagem de satélite, saturação excessiva, render artificial e fotografia banal sem força editorial. A foto deve traduzir o ângulo, não apenas ser bonita. Lugar específico requer foto real do lugar; imagem conceitual nunca é prova de um imóvel real. Fotos oficiais de imóveis exigem fonte autorizada e legenda correta. Preserve autoria, origem, licença e contexto. Escolha apenas dentre os arquivos permitidos, nunca invente imagem ou permissão.
EXCLUSÕES: sem perfis de corretores/imobiliárias, releases, campanhas ou lançamentos de terceiros. Curadoria de imóveis apenas com dados reais do catálogo autorizado; jamais invente disponibilidade, preço ou características.
VALIDAÇÃO: fontes primárias e independentes, datas e períodos claros; inferência explícita, não como fato; links internos úteis e reais; revisão factual, ortográfica e visual antes da publicação.`;
