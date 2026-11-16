# Journal Signature — revisão visual, 16/11/2026

Resultado da revisão independente: **SHIP**, sem achados materiais na matriz válida fornecida. Esta conclusão é restrita à evolução aprovada do Journal e às evidências abaixo; não aprova o site inteiro.

## Direção e implementação documentadas

A composição segue a nova referência enviada e o banner institucional `banner-blog.png`, fornecido pelo usuário. O banner foi convertido para WebP responsivo; no celular há recorte fotográfico e masthead HTML legível. A introdução editorial acompanha a matéria mais recente, com título e resumo HTML sobre fotografia. O acervo adapta a quantidade de colunas aos artigos reais, até quatro no desktop, duas em telas intermediárias e uma no celular estreito. Com três publicações, uma ocupa o destaque e duas aparecem no acervo inicial; nenhuma publicação fictícia completa a grade.

Gilda Display local é uma exceção restrita aos títulos editoriais da página Journal e da leitura. Manrope permanece no texto, metadados e cards. A galeria da home mantém sua composição anterior; marca, navegação e home permanecem fora desta evolução. O contrato está em `artifacts/lopes-signature/.impeccable/surfaces/src-pages-journal-page-tsx.md`.

A leitura mantém capa creditada, resumo, autoria, sumário, fontes, convite ao atendimento e leituras relacionadas. A seleção de imóveis usa registros reais do catálogo, com imagem e preço a partir de R$2 milhões: corresponde a menção explícita a Jardim Goiás, Marista ou Bueno no título/resumo, ou à editoria Imóveis & Curadoria. Exibe até dois links e não aparece sem correspondência. A seleção não comprova disponibilidade comercial.

O rodapé institucional continua único, sob responsabilidade de `src/components/site-footer.tsx` no layout público. As capturas mostram dados legais e Política de Privacidade. Deve-se preservar a linha `© {ano atual} Goiânia Negócios Imobiliários · CNPJ 19.246.027/0001-97 · CRECI CJ 30006`, o ano pelo fuso de Goiânia, os arquivos compartilhados do rodapé e o link `/politica-de-privacidade`.

## Matriz válida de evidências

Capturas em `artifacts/lopes-signature/.impeccable/review/magazine-20261116/`:

| Evidência | Escopo |
| --- | --- |
| `desktop-complete.jpg` | Journal completo, largura 1280px, banner, destaque, acervo e rodapé |
| `desktop.jpg` | Journal em largura intermediária de 739px; o nome do arquivo não significa viewport desktop |
| `mobile.jpg` | Journal completo, largura 390px |
| `article-desktop.jpg` | Leitura em desktop, largura 1280px |
| `article-mobile-reading.jpg` | Leitura em celular, largura 390px |
| `mobile-contact.jpg`, `mobile-related.jpg`, `mobile-footer.jpg` | Trechos inferiores da leitura: atendimento, relações e rodapé |
| `admin-specialist.jpg` | Editor com identificação, qualificação/registro e confirmação da revisão especializada |

`desktop-1280.jpg` e `article-mobile.jpg` foram excluídos por não constituírem capturas válidas da matriz. Outros arquivos na pasta não ampliam automaticamente o escopo aprovado. O detector reportado em `/tmp/signature-magazine-detect.json` retornou `[]`; esse resultado auxiliar não substitui a inspeção visual nem certifica acessibilidade.

Foram conferidos os arquivos `src/pages/journal-page.tsx`, `src/pages/journal-page.css`, `src/components/journal-gallery.tsx`, `src/components/journal-properties.tsx` e o trecho de aprovação especializada em `src/components/editorial-workspace.tsx`. O registro documental cotejou diretamente as capturas completas desktop e mobile com essa implementação; o resultado independente acima cobre a matriz completa informada.

## Estado editorial e limites

Três artigos permanecem públicos. O quarto, sobre transmissão familiar, permanece rascunho aguardando especialista. A interface registra nome, qualificação/registro e confirmação humana; não verifica habilitação profissional. O plano editorial é segunda, quarta e sexta às 9h de Brasília, condicionado à validação, conforme `OPERACAO.md`. Este documento registra a operação prevista e não comprova execução do agendamento, publicação, build remoto ou entrega do servidor.

A revisão visual não certifica fatos dos artigos, parecer jurídico/tributário, originalidade, validade das licenças, métricas de marketing, eventos analíticos ou desempenho de SEO. Não houve certificação numérica de contraste, auditoria integral de acessibilidade, teste de todas as combinações de conteúdo/erro/paginação, nem comprovação de atendimento ou aprovação especializada real. O rodapé visto em imagem não substitui os testes de exportação, SEO, campanhas, rota de privacidade ou canonical.

## Sistema visual e comparação de escopo

`DESIGN.md` foi atualizado somente na prosa do Journal. Seu frontmatter mantém os mesmos tokens globais de cor, tipografia, espaçamento, raios e componentes. A comparação de fonte mostra que as cores `--jr-*` permanecem locais a `.journal-page`/`.jr-home`, a nova fonte é declarada no CSS do Journal e os novos seletores editoriais não substituem os papéis globais Plus Jakarta Sans/Cormorant/Space Mono nem os papéis Manrope da home. Portanto esta continuação não requer alteração do sistema global de tokens.

`.impeccable/design.json` foi preservado. Já existia divergência narrativa entre o sidecar e `DESIGN.md` nas descrições de Bauhaus/header e guardrails (por exemplo, o sidecar combina “header-free landing pages” com a exceção de navegação no hero de Bauhaus). Essa divergência anterior não foi corrigida incidentalmente, e o sidecar não deve ser interpretado como documentação atualizada desta evolução do Journal. Nenhum código, mídia ou documento de outra landing page foi alterado por esta etapa documental.
