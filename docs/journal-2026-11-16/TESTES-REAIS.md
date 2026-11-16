# Ensaios reais da operação editorial — 16/11/2026

Versão testada: 6d54561, publicada na Vercel. Prévia protegida, sem salvar artigos, consumir a trava diária, subir mídia ou solicitar build. Cada ensaio solicita uma editoria diferente.

Configurações verificadas no servidor: OpenAI, Supabase, cron, esquema editorial e hook prontos. Frequência retornada: Segundas, quartas e sextas, às 9h de Brasília.

Bloqueio real: tentativa de publicar o rascunho tributário sem declaração especializada retornou HTTP 422. A versão e o estado do rascunho permaneceram inalterados.

| Editoria | Resultado | Pauta | Observação |
|---|---|---|---|
| Arquitetura & Design | preview (HTTP 200) | Entre luz e céu: a materialidade e atmosfera da luz em espaços residenciais | Revisão 90 |
| Mercado & Patrimônio | preview (HTTP 200) | Valorização e escassez: o que realmente pesa na decisão de comprar um imóvel em Goiânia em 2026 | Revisão 90 |
| Goiânia & Endereços | preview (HTTP 200) | Vila Nova e Setor Oeste: como memória, paisagem e cotidiano definem o valor de um endereço | Revisão 90 |

Uma rejeição comprova o bloqueio daquela etapa; não é uma aprovação da matéria. Notas são avaliação da IA, não validação humana. Nenhum dos ensaios criou publicação pública. As respostas completas foram mantidas em arquivos locais de trabalho para inspeção.

## Conclusão desta rodada

As três prévias da versão `6d54561` concluíram com `preview`, nota editorial 90 e fotografia identificada no acervo/licença. A nota é da revisão por IA, não certificação humana de exatidão. Não houve publicação nem alteração dos artigos durante os ensaios. A gravação/publicação, a correção seguida de nova revisão e o bloqueio após uma segunda reprovação também são cobertos pelos testes automatizados.

Os ensaios anteriores revelaram problemas de reconhecimento de fontes (`gov.br`, pesquisas internacionais e universidades federais), seleção de imagens, contradições entre contexto local e ensaio universal e diagnóstico da API. Foram corrigidos sem retirar os controles de fonte, licença, repetição, nota mínima ou revisão especializada. Uma aprovação anterior de texto com menção a retorno ao investidor motivou uma trava determinística adicional; o texto de teste não foi publicado.

Verificações: 20 testes do agente aprovados; checagem TypeScript do servidor aprovada; build público e testes de SEO/rodapé já aprovados nesta evolução. As três matérias públicas respondem HTTP 200, com um H1 e um rodapé cada. Revista e leitura foram verificadas em desktop e celular; registro da página pública em `.impeccable/review/magazine-20261116/production-journal.jpg`. Agenda observada ativa na Vercel: segunda, quarta e sexta, às 9h de Brasília.

Após esta rodada, foi aplicado somente um ajuste de apresentação ao texto gerado: remover o título quando a IA o repetir literalmente na primeira linha do corpo. O título continua sendo renderizado pelo template da página.
