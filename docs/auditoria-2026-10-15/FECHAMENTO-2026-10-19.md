# Correção da publicação e refinamento funcional

## Publicação
A implantação `fd6ea27` concluiu com sucesso nos dois projetos da Vercel. A API separada passou a usar a mesma aplicação Express e a mesma fronteira de rotas da função do site, com configuração explícita do framework Express. O caminho público não importa mais o roteador legado de CRM/PostgreSQL. A entrada de execução local continua disponível e agora exporta a aplicação para a hospedagem.

Referência da plataforma: https://vercel.com/docs/frameworks/backend/express .

O teste de aplicação inicia sem DATABASE_URL, verifica health check, diretório de especialistas, administração protegida e rejeição das rotas legadas de CRM, webhook e geração automática. Especialistas são atendidos antes do middleware de disponibilidade do catálogo, pois seu diretório não depende do banco.

## Design e uso
- Busca do catálogo compacta no celular; cidade e bairro continuam disponíveis ao abrir Filtros.
- Filtro Somente salvos, armazenamento opcional protegido contra falhas e recuperação do estado vazio.
- Acesso direto a fotos, plantas, localização e atendimento no celular, com alvos de toque de pelo menos 44 px.
- Tamanho legível do logotipo na navegação pública e rodapé.
- Estado vazio editorial do Journal com caminhos reais para catálogo e especialistas.
- Contraste corrigido da ação Limpar filtros e campos de busca com tamanho adequado no celular.
- Editor com verificação de estrutura do banco, indicação separada de falta da migração e de indisponibilidade, aviso de falta de atualização automática e proteção de saída com texto não salvo.

O detector Impeccable não encontrou problemas obrigatórios; os avisos de paleta/tipografia são variações locais já presentes nas páginas, preservadas nesta revisão. A revisão visual foi limitada a uma rodada em desktop/celular e uma confirmação após os ajustes.

## Banco e conteúdo: bloqueio confirmado
Consulta autenticada somente de leitura confirmou `column blog_posts.slug does not exist`. Não foi aplicada migração nem publicado artigo de teste. A chave de serviço REST disponível não fornece uma conexão SQL administrativa. Os plugins Supabase e Vercel foram encontrados, mas não estavam instalados/conectados ao concluir a revisão.

A migração preparada é transacional e agora inclui políticas restritivas que também impedem escritas diretas por anon/authenticated quando houver outras políticas permissivas antigas. Antes de aplicar, é necessário examinar as políticas efetivas e preservar backup da tabela. O backend usa a chave de serviço após verificar a sessão administrativa.

Para finalizar: conectar Supabase ao projeto correto e aplicar a migração; conectar Vercel e configurar o deploy hook privado no ambiente de produção. Sem esse hook, publicações ainda exigem um novo deploy para atualizar HTML e sitemap. A UI informa essa condição. A produção editorial com IA continua adiada conforme a conversa sobre o n8n existente.

## Validação
Build de produção, tipos do monorepo e da função Vercel, sete testes de SEO e seis testes de backend. No navegador: filtro de salvos retornou exatamente o imóvel marcado, Bairro ficou disponível ao abrir Filtros e os layouts do catálogo, Journal e página do imóvel foram conferidos em desktop e celular. Nenhum lead real foi criado como teste.
