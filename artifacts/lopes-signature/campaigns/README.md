# Landing pages City Park

Publicadas como páginas HTML independentes para preservar o design e não carregar o aplicativo React nas campanhas.

| Endereço público | Produto no catálogo |
| --- | --- |
| /city-park-majestic | city-park-majestic |
| /royal-city-park | city-park-royal |
| /city-park-palace | city-park-palace |

Origem: pastas de mesmo nome em `Projeto-Sites-Lopes/empreendimentos`. Majestic foi importado de `site/dist`; Royal e Palace de `site`. As pastas originais foram preservadas. Esta cópia no repositório é a versão publicada pelo Signature.

Os HTMLs ficam aqui; CSS, imagens e JavaScript ficam em `public/campanhas/<produto>`. `scripts/campaign-pages.mjs` exporta as URLs públicas, define a base dos ativos, preserva os links de seção, adiciona canonical e Open Graph e inclui as páginas no sitemap. O domínio padrão é https://www.lopessignature.com.br, acompanhando o redirecionamento do domínio sem www. `VITE_SITE_URL` pode substituir a origem em outro ambiente.

Os validadores de telefone originais foram preservados. A consulta de país utiliza `/api/visitor-country`, sem serviços externos de IP. Os formulários enviam para `/api/leads` pelo adaptador compartilhado `public/campanhas/lead-submit.mjs`; o backend existente valida E.164 e resolve o imóvel antes de gravar e encaminhar para o CRM configurado. O Royal corresponde ao cadastro `city-park-royal`.

UTMs e identificadores gclid/gbraid/wbraid são preservados na observação do contato, junto ao caminho da página e à planta quando disponível. Nenhuma chave secreta ou ID de conversão foi adicionado. O evento local `signature:lead-saved` ocorre apenas após resposta de sucesso com ID; conectar pixels exige os IDs da operação. Não implica rastreamento de anúncios já configurado.

Verificações: build, typecheck, `test:campaigns`, `test:seo` e navegação em desktop/celular. Os testes de persistência confirmada e erro usam respostas simuladas, sem criar contatos fictícios no banco de produção.
