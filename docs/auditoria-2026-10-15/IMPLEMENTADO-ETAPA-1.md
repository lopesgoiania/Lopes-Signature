# Etapa 1 — SEO, desempenho e base editorial

## Base reconciliada

Trabalho na branch `codex/seo-performance-foundation`, criada de `origin/main` em `edc6d3e`. Foram preservados catálogo, filtros, páginas comerciais e composição atual publicados no GitHub. A análise inicial foi feita sobre uma revisão anterior; os problemas de leads daquela revisão não foram reintroduzidos.

## Implementado localmente

- Exportação de páginas públicas com o próprio React existente: HTML completo antes do JavaScript, hidratação e estado de consulta isolado por página.
- Não foi feita migração para Next.js nesta etapa. A exportação do Vite permite corrigir o HTML imediatamente, preserva os componentes e não exige função de servidor a cada visita. Next.js/renderização dinâmica pode ser reconsiderado se o volume de atualizações justificar.
- 48 páginas públicas geradas a partir da API pública atual; sitemap XML com 33 URLs indexáveis. Categorias vazias, taxonomias não elegíveis, gestão e previews ficam fora do sitemap.
- Metadados por rota, canonical, Open Graph, JSON-LD de organização, breadcrumbs e artigos. Não foram inventadas datas de atualização para o sitemap.
- Remoção do fallback universal da Vercel: URLs públicas desconhecidas passam ao 404 estático. Gestão e previews conservam seu shell com noindex. A resposta HTTP foi verificada na prévia local; o roteamento Vercel ainda precisa ser confirmado no deploy de preview.
- Carregamento de páginas por demanda e cliente Supabase fora do carregamento público inicial. Bundle principal local: aproximadamente 345 KB / 112 KB gzip. Não é uma medida completa de bytes transferidos de toda a página nem um resultado de Core Web Vitals.
- WebP responsivo para 16 retratos e 2 imagens de abertura, com srcset, dimensões e carregamento apropriado. Originais do grupo: 30.609.907 bytes; todas as variantes: 2.148.302 bytes. A economia resulta de compressão e redimensionamento. Originais, proveniência, nomes e enquadramentos preservados.
- Blog com consulta individual, suporte seguro a HTML/Markdown, headings/listas/ênfase/links, fontes e contato relacionado.
- Falhas do banco passam a retornar erro; não são mais apresentadas como um blog vazio ou uma publicação bem-sucedida em memória.
- Editor autenticado com rascunho, publicação, arquivamento, preview do corpo, metadados e fontes. Controle de concorrência evita sobrescrever uma revisão alterada desde a abertura do editor.
- Endpoints antigos de geração estão desativados; não há chamadas pagas de IA nem armazenamento de chave de provedor no novo editor.
- Hook opcional para recompilar páginas após alterar imóveis, taxonomias ou artigos públicos. Falha do hook não desfaz gravação: é informada separadamente.

## Infraestrutura informada pelo usuário

O usuário já tem VPS Hostinger e n8n em operação com outras automações. Isso muda a recomendação editorial: aproveitar o n8n como orquestrador da pesquisa, revisão e agenda passa a ser a hipótese preferida. A API do site continua responsável por autorizar e validar o conteúdo. Nenhuma automação, banco ou serviço dessa VPS foi alterado.

A plataforma atual continua utilizando seu Supabase existente. Não se assumiu que o banco da VPS seja o mesmo banco nem se iniciou migração de dados.

Vercel Hobby não é ilimitada: a documentação consultada em 15/10/2026 inclui 1 milhão de execuções de funções/mês, além de cotas de tráfego e computação. O plano é destinado a uso pessoal não comercial. Para o site imobiliário, avaliar Vercel Pro ou hospedar o site também na VPS; a exportação estática não depende da Vercel. [Regras oficiais](https://vercel.com/docs/limits/fair-use-guidelines).

## Ativação pendente — não executada

1. Confirmar destino/domínio e projeto de publicação. `VITE_SITE_URL` controla canonicals; `CONTENT_API_URL` informa a origem pública de conteúdo consultada no build. Nunca apontar esta variável para um endpoint administrativo ou colocar chaves em URL.
2. Publicar primeiro os novos controles de leitura/autorização em um ambiente de preview. A API antiga considera todo registro publicado; não criar rascunhos usando a versão antiga.
3. Inspecionar schema, políticas e backup do banco, então aplicar `migrations/20261015_blog_editorial.sql` no banco correto. A migração é necessária para gravar pelo novo editor. Ela foi preparada, mas NÃO executada. Exige revisão das políticas existentes; chaves service-role continuam somente no backend.
4. Configurar `SIGNATURE_ADMIN_EMAILS` no servidor e `SUPABASE_SERVICE_ROLE_KEY` adequada. O frontend autentica a sessão, e o servidor verifica a conta autorizada em cada chamada editorial.
5. Definir e configurar `SITE_REBUILD_HOOK_URL` no backend, ou um processo equivalente na VPS. A URL é secreta e nunca deve ter prefixo VITE_. No n8n, o deploy/rebuild pode ser uma etapa após aprovação/publicação; o workflow ainda será discutido.
6. Validar em staging o ciclo rascunho → publicação → rebuild → URL e sitemap, incluindo arquivamento. Uma publicação salva no banco não está concluída até o novo HTML ser disponibilizado. O editor mostra essa distinção.
7. Só então publicar a nova versão no domínio oficial, conferir os redirects e enviar o sitemap ao Search Console.

**Atualização do conteúdo:** o site exportado é uma fotografia de conteúdo público no momento do build. Um artigo ou imóvel novo precisa de nova compilação para ganhar sua URL HTML; conteúdo retirado pode permanecer no HTML antigo até a atualização. Falha na leitura da API interrompe a compilação para preservar o deploy anterior. Para conteúdo que exige retirada imediata, fazer a atualização do HTML imediatamente ou adotar um mecanismo dinâmico de publicação antes de depender dessa operação.

**Rollback:** após criar rascunhos, não reativar a API antiga que publicava todos os registros. Um rollback do frontend não deve remover os filtros de publicação do backend.

## Como validar localmente

```sh
pnpm run typecheck
pnpm --filter @workspace/lopes-signature build
pnpm --filter @workspace/lopes-signature test:seo
pnpm --filter @workspace/scripts exec tsx --test ../artifacts/api-server/tests/blog.test.ts
pnpm --filter @workspace/api-server build
pnpm --filter @workspace/lopes-signature exec tsc -p api/tsconfig.json --noEmit
pnpm --filter @workspace/lopes-signature serve:export
```

Os testes backend devem ser executados sem credenciais de produção no ambiente. Eles usam banco não configurado e autenticação simulada, sem enviar dados externos. A prévia `serve:export` serve os arquivos reais, responde 404 para URLs ausentes e permite apenas consultas públicas à API configurada; não envia formulários.

11 testes específicos passaram: 7 de SEO/HTML e 4 de publicação/autorização/erros. Tipos e builds passaram na rodada de implementação; os comandos devem ser repetidos após qualquer alteração posterior.

## Ainda não resolvido nesta etapa

- Configuração efetiva de hospedagem, migração do banco e deploy: sem alteração em produção.
- Especialistas, contatos e redes: dependem dos dados corretos; não foram inventados ou substituídos.
- Acervo remoto do Storage: ainda não convertido. As 18 imagens otimizadas são arquivos locais conhecidos.
- Search Console, GA4, métricas reais e consentimento: sem acesso e sem ativação simulada.
- Agente de pesquisa e geração automática, orçamento e conexão n8n: deliberadamente em discussão; não ativados.
- Suite completa de CRM/analytics/gestão legada e auditoria das políticas reais: continuam necessárias antes de expor o servidor completo na VPS.
- Aviso existente de sourcemap do tooltip persiste, sem impedir build.
