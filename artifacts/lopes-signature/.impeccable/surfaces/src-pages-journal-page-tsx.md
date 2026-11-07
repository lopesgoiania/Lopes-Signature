# Journal Signature — operação editorial e galeria
Primary target: src/pages/journal-page.tsx
Related targets: src/pages/journal-page.css, src/components/journal-gallery.tsx, src/components/home-editorial.tsx
Mode: Read

## Direction contract
THESIS: Uma revista local de Goiânia, urbanismo, qualidade de vida e patrimônio para o leitor de alto padrão. Conteúdo original, apurado e acompanhado de fotografias com origem e licença.
OWN-WORLD: Herdar o papel quente, grafite, Manrope e dourado fosco da home aprovada. A referência enviada pelo usuário fixa a composição: matéria principal fotografada à esquerda, duas chamadas menores à direita; depois acervo em grade e paginação. Não copiar newsletter, barra multicolorida ou marcas da referência.
STORY: Home mostra só três recentes → Journal mostra recentes e acervo → artigo com capa, resumo, sumário, leitura e fontes → catálogo/atendimento.
FIRST VIEWPORT: Na página Journal, título e descrição curtos, galeria de fotografia real com hierarquia editorial e metadados legíveis. Com uma matéria, ocupar a composição sem inventar duas notícias; os espaços laterais podem explicar os temas reais do Journal, sem títulos de artigos inexistentes. Home mantém todos os blocos anteriores e posteriores e muda apenas o Journal; cores retornam ao commit 0996ec0, sem reintroduzir o controle de vídeo removido pelo usuário.
FORM: Implementação code-led, estrutura fixada pela imagem de referência do usuário, sem exploração de outra identidade. Paginação de 9 artigos e filtro por categoria, sem controles inúteis enquanto não houver acervo suficiente. Links com estado real, capas com proporção estável e créditos completos na leitura.
QUALITY BAR: Nenhum artigo sem capa na galeria; nenhuma imagem de empreendimento como prova de um assunto que ela não mostra; nenhum conteúdo inventado para preencher layout; mobile empilha sem rolagem horizontal. Todo CSS novo é restrito ao Journal; nenhuma regra global alterada.
FINISH: Capturas desktop/mobile da galeria e da leitura; revisão independente e documentação do escopo.
