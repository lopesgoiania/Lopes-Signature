# Ativação do Journal com IA

O código já contém pesquisa, redação, revisão e publicação. A ativação em produção depende das migrações, dos segredos e de um deploy. Nenhuma chave deve ser colocada no código ou enviada no chat.

## 1. Banco de dados

No SQL Editor do Supabase do site, execute nesta ordem:

1. `migrations/20261015_blog_editorial.sql` (se ainda não aplicada; preserva os artigos publicados).
2. `migrations/20261107_blog_agent.sql`.

A segunda migração cria o histórico de execuções e uma função restrita ao servidor para impedir execuções simultâneas. A tabela não é pública. Faça backup antes de alterar um banco de produção.

## 2. Vercel

No projeto que serve lopessignature.com.br, Settings → Environment Variables, selecione Production e cadastre:

| Nome | Valor |
| --- | --- |
| `OPENAI_API_KEY` | Chave privada da sua conta OpenAI com saldo e acesso à API |
| `OPENAI_BLOG_MODEL` | `gpt-4.1` (ou outro modelo compatível com Responses, web search e structured outputs) |
| `SUPABASE_URL` | URL do Supabase utilizado pelo site |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada service role desse mesmo Supabase |
| `CRON_SECRET` | Segredo aleatório longo (pelo menos 32 caracteres) |
| `SITE_REBUILD_HOOK_URL` | Deploy Hook privado da branch de produção |
| `VITE_SITE_URL` | `https://lopessignature.com.br` |
| `CONTENT_API_URL` | `https://lopessignature.com.br` |
| `SIGNATURE_ADMIN_EMAILS` | Emails dos administradores, separados por vírgula |

Preserve as variáveis públicas Supabase já usadas para login. Nunca prefixe OpenAI, service role, cron ou hook com `VITE_`.

Para criar o hook: Settings → Git → Deploy Hooks, nome `journal-publicacao`, branch de produção. Copie o endereço para `SITE_REBUILD_HOOK_URL`.

O site está em `artifacts/lopes-signature`; sua função `api/index.ts` importa o backend compartilhado. Confirme a Root Directory usada pelo projeto existente e habilite inclusão de arquivos fora dela se exigido pelo monorepo. Preserve os comandos existentes de instalação e build. A configuração da pasta do site contém o cron e duração máxima de 300 segundos. Confirme que o plano da Vercel permite essa duração; três chamadas OpenAI têm limite individual de 80 segundos.

O cron faz GET em `/api/cron/generate-blog`, segunda, quarta e sexta às 12h UTC (9h Brasília). A Vercel injeta `Authorization: Bearer <CRON_SECRET>`. Os horários podem ter variação conforme o plano. O cron só entra em vigor após o deploy de produção. O agendamento fica somente em `artifacts/lopes-signature/vercel.json`, no projeto que serve o site. Os arquivos de configuração da API separada e da raiz não possuem cron, para impedir acionamentos duplicados. Se a hospedagem do agendamento for transferida no futuro, mova a configuração em vez de copiá-la.

Não ative o cron do site antigo antes de publicar o backend atualizado. Depois de salvar as variáveis, publique as alterações do código ou faça redeploy incluindo esses arquivos. Alterar variáveis sem novo deploy não atualiza funções já publicadas.

## 3. Primeiro artigo

1. Entre em `/admin`, aba Blog & Agente de IA.
2. Confira que OpenAI, banco e publicação aparecem configurados.
3. Clique **Pesquisar e publicar com IA**. Aguarde até alguns minutos.
4. Acompanhe o deploy disparado pelo hook na Vercel: hook aceito não significa build concluído.
5. Abra `/journal`, o artigo e `/sitemap.xml` para conferir a página HTML e a URL no sitemap.
6. Confira a seção Cron Jobs na Vercel para confirmar que o agendamento foi registrado.

Se o hook falhar, use **Atualizar site**. Esse botão solicita novo build sem gerar outro artigo ou gastar novamente com IA. Se o build falhar após o hook ser aceito, consulte os logs na Vercel e repita a atualização após corrigir a causa. Os erros da geração ficam visíveis no editor.

## Como funciona

- Pesquisa web obrigatória: pauta recente sobre Goiânia/região, empreendimentos e tendências úteis para imóveis acima de R$ 2 milhões. Altimob é referência possível, com confirmação em fontes primárias; não é copiada nem tratada como catálogo da Lopes.
- Se não houver novidade suficiente, pode produzir conteúdo de serviço local baseado em fontes atuais, sem chamar informação antiga de novidade.
- Redação original em Markdown com resumo e metadados SEO; sem imagens de terceiros ou imóveis inventados.
- Duas fontes de domínios distintos, links correspondentes à pesquisa e identificação de fonte primária na revisão.
- Nova chamada de revisão avalia sustentação factual, atualidade, recorte de público e repetição. Se rejeitar, não salva nem publica. A revisão é feita por IA, não garante ausência de erros e não substitui avaliação editorial humana.
- Bloqueios locais para campos inválidos, HTML, citações fora das fontes e títulos semelhantes. O histórico das 100 pautas mais recentes orienta pesquisa e revisão; endereço único no banco também impede colisões.
- Um artigo por data de Brasília, incluindo acionamentos manuais. A trava atômica no Supabase impede concorrência; falhas podem ser repetidas. Execuções interrompidas podem ser retomadas após 15 minutos, se não houver artigo salvo naquela data.
- Se um artigo já foi salvo mas a execução interrompeu antes do hook, repita **Atualizar site**, não a geração.
- Artigo aprovado é publicado diretamente no banco. A página HTML e o sitemap surgem após o build disparado pelo hook concluir. Não existe garantia de posicionamento no Google.

## Validação realizada localmente

Testes com respostas simuladas cobrem fluxo completo, rejeição editorial, citações, duplicatas, autenticação do cron, acesso administrativo, falha no hook e repetição sem nova geração. A chave OpenAI e o banco de produção não foram usados nesses testes; o primeiro artigo real precisa ser conferido após configurar o ambiente. A migração deve ser aplicada e validada no Supabase antes da ativação.

## Revisão de publicação

O cron foi centralizado no projeto do site; não há agendamento duplicado na API separada ou na raiz do repositório. A configuração publicada mantém 300 segundos para a função do site. O código usa pesquisa obrigatória (`web_search` com `tool_choice: required`) e saídas estruturadas na Responses API, conforme a [documentação de pesquisa](https://developers.openai.com/api/docs/guides/tools-web-search) e [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).

Publicar o código não equivale a aplicar as migrações ou cadastrar os segredos. O diagnóstico do painel deve confirmar essas condições antes da primeira geração real. Os testes desta revisão usaram respostas simuladas, sem gasto com OpenAI e sem inserir artigo no banco de produção.
