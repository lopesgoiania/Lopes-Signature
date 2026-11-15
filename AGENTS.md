# Padrão do rodapé público do Lopes Signature

Ao editar, criar ou preparar para indexação uma página pública em `artifacts/lopes-signature`, preserve o rodapé padrão da home. Vale para home, catálogo, categorias, bairros, fichas de imóveis, Journal, páginas institucionais, Política de Privacidade e landing pages de produtos.

- A fonte do rodapé é `src/components/site-footer.tsx`. O layout público de `src/App.tsx` já o inclui. Evite adicionar outro rodapé diretamente nas páginas React. O painel administrativo fica fora desse layout público.
- Nas campanhas HTML, `scripts/campaign-pages.mjs` reutiliza a marcação do mesmo componente e exporta exatamente um rodapé por página. Mantenha as informações específicas do produto, como registro de incorporação e avisos sobre perspectivas, junto ao conteúdo do empreendimento. Evite duplicar o rodapé institucional.
- Preserve a linha `© {ano atual} Goiânia Negócios Imobiliários · CNPJ 19.246.027/0001-97 · CRECI CJ 30006` e o link visível para `/politica-de-privacidade`. Não use ano fixo. O ano vem do fuso de Goiânia e é atualizado no navegador mesmo para HTML estático.
- Use os arquivos compartilhados `public/signature-footer.css` e `public/signature-footer-year.js`. Não reintroduza a frase “Valores e disponibilidade devem ser confirmados com a equipe.” no rodapé.
- Ao revisar a exportação, confirme que o HTML contém um único rodapé padrão, os dados legais e o link para a política. Confira a rota de privacidade, a URL canônica e os testes de SEO e campanhas. Não edite `dist/` diretamente.
