# Revisão de publicação — Journal IA e paleta

## Alterações incorporadas do Journal
- Agente no backend com pesquisa web obrigatória na Responses API, redação estruturada, revisão independente por IA e publicação após aprovação.
- Checagens de fontes, citações, tamanho, foco local, títulos repetidos e ausência de HTML; modelo configurável via OPENAI_BLOG_MODEL.
- Histórico e trava diária no Supabase; uma publicação por data de Brasília, com possibilidade de retomar falhas.
- Geração manual e nova solicitação de build protegidas por sessão administrativa. Cron protegido por CRON_SECRET e comparação de tempo constante.
- Painel exibe configuração e última execução; repetir build não gera novo artigo.

## Ajustes desta revisão
- Cron centralizado somente no projeto do site (`artifacts/lopes-signature/vercel.json`), segunda/quarta/sexta às 12h UTC. Removidos agendamentos duplicados da API separada e configuração raiz.
- Blocos, painel, campos e rodapé da home em cinzas neutros; faixa de navegação preta com links/setas brancos.
- Removido o botão de pausar/reproduzir do hero conforme solicitação. Preservados o vídeo, a preferência de movimento reduzido e o fallback para imagem quando reprodução falha.
- Layout, conteúdo e demais elementos da abertura preservados.

## Validação
- Tipos do Signature, backend e função Vercel aprovados; builds do site e backend concluídos.
- Dez testes backend (incluindo agente com respostas simuladas) e sete testes SEO aprovados.
- Conferência no navegador desktop/celular: backgrounds RGB 36/36/36, 50/50/50 e 38/38/38; faixa 0/0/0, links/setas 255/255/255; botão do hero ausente, sem overflow horizontal.
- Consulta autenticada somente de leitura ao banco: colunas editoriais e tabela blog_generation_runs já existentes. Nenhuma migração foi executada nesta revisão.
- Não houve chamada real paga da OpenAI nem artigo criado como teste. Cadastro de segredos, validade da chave, aceitação do hook e primeiro artigo precisam ser confirmados no ambiente de produção. A integração Vercel disponível retornou 403 para a equipe lopes-mkt; o fluxo GitHub já autorizado continua sendo o meio de publicação e verificação pública.
- Arquivos de crachá, dependências locais compartilhadas e demais materiais não relacionados não foram incluídos.
