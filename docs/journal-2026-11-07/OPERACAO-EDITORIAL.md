# Journal Signature — operação editorial diária

## Escopo

A home recupera a paleta da versão `0996ec0`. A abertura, o vídeo, a navegação, a seleção de imóveis, os blocos institucionais e o atendimento mantêm sua composição. A intervenção funcional na home fica na seção Journal.

A galeria usa os três artigos publicados mais recentes, ordenados por `publishedAt`: o último ocupa a capa maior, os dois anteriores as chamadas menores. Alterar um artigo antigo não o transforma em uma publicação nova. Com apenas uma matéria, uma nota editorial ocupa o espaço ainda sem chamadas; nenhuma matéria é inventada. O Journal reúne todos os artigos, nove por página, com filtro por tema quando houver variedade. A paginação só aparece a partir da segunda página.

## Rotina

`0 12 * * *`, diariamente às 12h UTC / 9h de Brasília, no projeto Vercel do site. O segredo `CRON_SECRET` protege a rota. Uma trava atômica no Supabase e o identificador diário impedem duas publicações no mesmo dia, inclusive em acionamentos manuais.

1. **Radar:** pesquisa web obrigatória em veículos locais/nacionais e no radar da AutImob; propõe três pautas distintas, confrontando o histórico das últimas100 publicações.
2. **Seleção:** uma chamada estruturada escolhe o ângulo, a editoria e o interesse local. Exige nota mínima80 e rejeita promoção de empresas.
3. **Apuração:** nova pesquisa web, centrada na pauta escolhida, reúne fatos, URLs, datas, períodos dos dados e divergências. São necessárias três referências, dois domínios e uma fonte primária institucional.
4. **Imagens:** busca fotografias contextuais em Wikimedia Commons, verifica metadados de licença e oferece também o acervo local já identificado. A redação seleciona a capa pelo assunto e pela legenda real.
5. **Redação e SEO:** produz artigo original, entre650 e1400 palavras na validação técnica (direção editorial750–1100), título, resumo, metadescrição, palavras-chave e links internos conhecidos. Não pode inventar URLs nem tratar números antigos como notícia atual.
6. **Revisão:** outra chamada avalia sustentação, utilidade local, texto, repetição, promoção indevida e adequação da imagem. Exige nota mínima85, interesse no público, ausência de promoção e imagem pertinente.
7. **Publicação:** só após aprovação, guarda a capa no acervo local/Supabase, grava artigo e créditos, conclui a execução e solicita um novo build para páginas HTML e sitemap.

A revisão continua sendo por IA: as notas não são validação humana nem garantia de precisão. Não há promessa de indexação ou posição no Google. A meta é uma publicação diária; se a apuração, a licença ou a qualidade falharem, o artigo não é publicado para completar uma cota. A falha fica registrada com a etapa e pode ser repetida pelo administrador.

## Editorias e exclusões

- Goiânia e bairros: desenvolvimento urbano, infraestrutura, cidade, entorno e perspectivas.
- Mercado e patrimônio: tendências, dados, valorização histórica com período explícito e discussão educativa de patrimônio.
- Arquitetura e vida: arquitetura, urbanismo, conforto, áreas verdes e qualidade de vida.

Excluídos: perfis ou desempenho de corretores, imobiliárias, premiações, contratação, campanhas, releases e lançamentos específicos de outras empresas. Uma notícia pode inspirar análise de um movimento urbano; o artigo não é publicidade da empresa citada nela. Não se reproduz ou apenas reformula uma matéria da AutImob.

O público é o leitor residencial de alto padrão. O texto não precisa repetir “R$2milhões”; precisa ampliar seu repertório sobre Goiânia. Não há recomendação de investimento individual, promessa de retorno, liquidez ou valorização futura garantida.

## Imagens, direitos e créditos

O acervo inicial tem fotografias reais, não imagens de empreendimentos reaproveitadas como ilustração de outra situação. Origem, fotógrafo e licença estão em `src/lib/journal-media.json`, nas fichas ao lado dos JPEGs e nos metadados internos dos arquivos. As imagens foram redimensionadas/recomprimidas; o recorte é feito pela apresentação responsiva.

A descoberta automática aceita somente CC BY, CC BY-SA, CC0 ou domínio público conforme metadados do Commons; não aceita NC/ND ou licença ausente. Só baixa de hosts Wikimedia autorizados, limita formato/tamanho e guarda crédito, fonte, licença e legenda. A fotografia de arquivo é contexto, não registro atual de obra ou evento. A capa possui créditos visíveis na leitura e dados estruturados de imagem. Imagens internas do acervo incluem sua própria atribuição.

Não se extrai imagem de notícia só porque ela é pública. Eventual fotografia de um veículo exige autorização específica ou licença compatível antes de entrar no acervo. Geração de imagem por IA não é necessária para esta versão e não foi ativada como custo recorrente.

## Dados e observabilidade

Não foi necessária nova migração. `blog_posts.sources` é um conjunto de proveniências: referências documentais normais, entradas `kind:image` com metadados da imagem e entrada `kind:editorial` com versão, ângulo, palavras-chave, notas e referência primária. A API apresenta referências separadamente dos metadados de mídia. O editor preserva esses registros quando edita texto mantendo a capa.

`blog_generation_runs` registra início, conclusão, falha com etapa e estado do hook. Segredos permanecem no servidor. O hook aceito indica solicitação, não conclusão do build; o resultado do build é acompanhado na Vercel. “Atualizar site” repete o build sem gerar texto nem consumir de novo as cinco chamadas editoriais.

A rota administrativa `POST /api/admin/blog/preview` testa as cinco chamadas reais sem reivindicar o dia, gravar artigo, subir imagem ou disparar build. Ela exige a mesma autorização administrativa do editor. Serve para aferir a operação antes de uma publicação, sem criar artigos falsos no acervo.

## Verificação

Testes cobrem acesso, idempotência, bloqueio editorial, licenças/hosts de mídia, prévia sem gravação, ordenação da capa, paginação e HTML/SEO. Fotografias foram verificadas por metadados de licença e origem. Evidência visual local está em `.impeccable/review/journal-20261107`.

O acervo de90 matérias usado para testar uma página intermediária é uma fixture local, não conteúdo público. O navegador integrado não aplicou o override de viewport; para390px usou-se iframe real de390px, medido sem transbordamento, e capturas do quadro. A revisão independente aprovou a galeria e a correção de paginação no escopo inspecionado; não certificou o backend nem a região inferior do artigo em celular.
