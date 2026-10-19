# Atualização de 19/10/2026

## Entrega
- HTML pré-renderizado em 48 páginas públicas, sitemap com 33 URLs elegíveis, metadados por rota e 404 real.
- Journal com páginas de artigos, renderização segura e editor com autenticação. IA continua desativada enquanto se define o fluxo com o n8n existente.
- Diretório único de 32 especialistas, sem as fotos antigas, separado por Marista, Bueno e Jardim Goiás.
- Rodapé compartilhado na home, catálogo, especialistas, contato, sobre e Journal: três unidades, telefone e e-mail clicáveis; removidos links genéricos de redes sociais e links para páginas legais inexistentes. Os textos legais aprovados ainda precisam ser fornecidos.
- Removido WhatsApp fictício da página de contato; ação agora liga para a central já cadastrada.
- Catálogo com ordenação por preço/área, limpeza funcional dos filtros, cartões mais discretos e hierarquia responsiva.
- Página de imóvel com foto principal proporcional, título dimensionado, favoritos compartilhados com o catálogo e Google Maps em iframe com carregamento tardio, independente da chave JavaScript usada na edição administrativa.
- Mapas usam o endereço cadastrado e são identificados como referência; endereço sem número não permite prometer um ponto exato.
- Capas de 22 imóveis com derivados WebP em 480/960/1600 px (limitados ao original), tamanhos de exibição declarados e carregamento tardio nos cartões. Fotos de galeria remotas continuam sob demanda; não foram todas convertidas.
- Script manual `scripts/optimize-catalog-covers.py` permite atualizar os derivados. Uma URL nova utiliza a imagem original até sua próxima otimização. Nenhum processamento de imagem ocorre durante a navegação.

## Pendências reais
- Aplicar `migrations/20261015_blog_editorial.sql` no banco, após conferir estrutura e políticas existentes. Sem essa migração, o editor apresenta o erro de banco em vez de fingir que salvou.
- Configurar `SITE_REBUILD_HOOK_URL` na hospedagem para reconstruir as páginas após alterações públicas. Sem hook, cada alteração precisa de nova publicação para atualizar o HTML dos buscadores.
- Novas fotos dos especialistas, redes sociais oficiais e textos legais dependem dos dados fornecidos pelo responsável.
- Automação editorial/n8n ainda não ativada; nenhum artigo fictício foi publicado.
- Métricas de Core Web Vitals em usuários reais precisam ser acompanhadas após a publicação. Nenhuma pontuação de Lighthouse foi presumida.

## Validação
Build de produção, tipos do monorepo e da função Vercel, sete testes de SEO/renderização e quatro testes de publicação/autorização. Verificação visual em desktop e celular do catálogo e página de imóvel, ordenação por menor valor e mapa visível.
