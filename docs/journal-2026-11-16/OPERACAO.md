# Signature Journal — operação editorial, 16/11/2026

Esta versão substitui a rotina diária e a direção de capas documentadas anteriormente. A arte final banner-blog.png foi fornecida pelo usuário e substitui a pendência de banner do briefing.

## Edições

Segunda, quarta e sexta, às 9h de Brasília (12h UTC), expressão Vercel `0 12 * * 1,3,5`. Segunda prioriza Arquitetura & Design / Lifestyle & Experiências; quarta, Mercado & Patrimônio; sexta, Goiânia & Endereços / Imóveis & Curadoria. O histórico das últimas 100 publicações, seus resumos e ângulos acompanha a pesquisa; a distribuição das últimas 15 informa o planejamento. A meta é três edições, sem obrigar publicação quando a validação falhar.

## Pesquisa e escrita

Cinco chamadas: radar com pesquisa web; seleção estruturada de pauta; apuração com nova pesquisa; redação com análise visual das candidatas; revisão independente com pesquisa web e imagem da capa. Seleção registra três opções de título, intenção/público e direção de imagem. Redação produz 550–1000 palavras como direção, com validação de 450–1400, sem extensão artificial. Exigem-se três referências, ao menos dois domínios e fonte primária institucional. URLs equivalentes sem rastreamento UTM são reconhecidas sem admitir fontes inventadas. A revisão examina fatos, datas, proposta versus execução, fontes, originalidade, linguagem, adequação e fotografia. Nenhuma nota da IA é garantia de exatidão ou revisão humana.

## Direção de arte

Fotografia arquitetônica, materialidade, luz e composição; lugares específicos exigem registros reais. Martelos, chaves, miniaturas, contratos, dinheiro, satélite e mapas técnicos foram excluídos da seleção. A comparação de identidade bloqueia capas das últimas 12 publicações, inclusive cópias locais/Storage/Commons. A redação vê até seis imagens, e a revisão vê a escolhida. Sem imagem pertinente e de qualidade, a geração é bloqueada.

O acervo inclui fotografias reais do Commons (licenças compatíveis verificadas na origem) e fotografias de interiores/arquitetura com licença Unsplash, selecionadas individualmente e creditadas. Estas últimas são contexto: nunca representam um imóvel disponível em Goiânia. Os arquivos mantêm fichas de origem; novas mídias locais têm WebP e variantes 640/1200/original. Não foi ativada geração recorrente de imagens por IA. O banner institucional fornecido não integra o acervo de capas de artigos.

## Governança

Conteúdo jurídico, tributário, sucessório ou financeiro sensível vai para `draft`, `published:false`, com `validationStatus:awaiting_specialist`. Uma regra determinística complementa a classificação da IA. A execução pode concluir com `needs_review`, sem solicitar atualização do site público.

No editor, a publicação desse conteúdo exige nome do profissional, qualificação/registro e confirmação da revisão. O servidor vincula a aprovação ao hash de título, resumo e conteúdo e registra administrador autenticado e data. Alterar a versão invalida a aprovação anterior. A identidade do administrador e o hash não são expostos na API pública. O formulário registra uma declaração humana; não verifica automaticamente a habilitação profissional. A equipe continua responsável por obter a revisão especializada real.

A matéria de transmissão familiar foi revisada, mas permanece rascunho sem aprovação especializada. As outras três foram revistas e preservam slug e data de publicação. Versões antes/depois e comparação em `revisao/`; o backup completo anterior às alterações está no ambiente de trabalho. Não houve exclusão de artigos nem migração SQL.

## Publicação e observabilidade

A trava atômica existente mantém a idempotência diária. Credenciais ficam no servidor. Falhas registram etapa e mensagem em `blog_generation_runs`; o hook solicita o build, sem afirmar que já concluiu. Fontes, editoria, ângulo, opções de título, público/intenção, palavra-chave, justificativa de capa, links internos e estado de validação ficam no registro editorial do artigo.

A prévia protegida aceita `{category: "uma das cinco editorias"}` e não salva, reivindica o dia, sobe arquivo nem publica. Ela permite testar editorias diferentes sem produzir conteúdo fictício no acervo. O registro dos três ensaios reais desta atualização será anexado à validação.

## Site e negócio

A home e a navegação foram preservadas; somente a galeria recebe os artigos revisados. A página Journal recebe o banner, destaque da publicação mais recente, grade adaptativa (até quatro colunas), categorias e paginação. Títulos e metadados de cards são HTML; o banner final mantém a arte recebida. No celular, usa recorte fotográfico e título/chamada HTML para leitura.

A leitura conserva sumário, fontes, créditos e rodapé institucional único. A seleção relacionada usa o catálogo real: correspondência de bairro explícito no título/resumo ou a editoria Imóveis & Curadoria, com imóveis acima de R$2 milhões e imagem. Sem correspondência, não renderiza seleção. Não promete disponibilidade nem inventa preço/atributo.

Meta Pixel e Google Tag Manager existentes foram preservados. A presença do código não comprova eventos, consentimento, conversões atribuídas ou configuração de relatórios. Não foram inventados números de tráfego, impressões, cliques ou resultados de SEO; relatórios dependem das contas analíticas e do Search Console configurados pela equipe.
