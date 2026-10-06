# Integração das alterações do GitHub — 06/10/2026

Base local preservada: 7aeec4fe00dfbc2fa15c6dbf538dbc242dc38972.
Origem integrada: origin/main em 60fb1719b013b73b7bf85b1f1f91d512af806ead.
Backup local: backup/pre-integracao-2026-10-06.

## Incorporado
- Páginas Sobre nós e Journal, rotas de artigos, estados de carregamento/erro/vazio e renderização restrita do conteúdo HTML.
- Navegação institucional e editorial; /conteudos abre o Journal.
- Links dos artigos da home e linguagem de inscrição no Journal.
- Equipe sem perfis fictícios de fallback ou contagem comercial sem comprovação; preservados filtros por unidade e retratos inteiros.
- API pública de leitura, correções de dependências e configuração de publicação do colaborador.
- Asset Epic preservado, sem substituir o vídeo aprovado da home.

## Preservado
- LP Bauhaus completa, Hero cinematográfica e estilos próprios, sem alterações nos seus arquivos.
- Paleta clara, tipografia, vídeo da home, catálogo, FAQ e correções da página de contato.
- O layout e os textos conflitantes da home mantêm a versão aprovada; o conteúdo institucional novo está em Sobre nós.

## Ajustes na integração
- Novas páginas adaptadas à paleta atual para evitar texto claro sobre fundo claro.
- Menu desktop ampliado somente a partir de xl, com menu compacto abaixo desse tamanho.
- Newsletter mantém os dados quando ocorre erro e bloqueia envios duplicados.
- Removido telefone de exemplo dos especialistas; contato pela página de atendimento até cadastrar números reais.
- Removida credencial administrativa fixa do Supabase. Backend depende das variáveis de ambiente existentes.

## Validação
- Typecheck frontend e função pública: aprovados.
- Build frontend e backend: aprovados. Avisos existentes de sourcemap e tamanho de bundle persistem.
- API pública compilada: GET specialists/blog retorna 200; GET leads retorna 404; POST leads retorna 405.
- Navegador: Sobre nós desktop, Journal mobile com estado vazio (API atual sem artigos), filtros Marista e retratos object-contain sem overflow mobile, Bauhaus notebook, vídeo da home carregado.
- Artigo individual não validado com conteúdo real: catálogo editorial atual vazio.

## Pendências de publicação
- A função pública trazida do GitHub é intencionalmente somente leitura. Formulários de contato/newsletter/LP não são recebidos por ela; analytics também não é montado. É necessário integrar um endpoint de captação antes de considerar o site pronto para campanhas. Rotas de CRM não foram expostas para contornar isso.
- A chave administrativa removida ainda existe no histórico anterior do Git. Rotacionar no Supabase e atualizar a variável de ambiente do servidor. Nenhuma credencial deve ser colocada no frontend.
- A rota de leads do servidor completo também necessita revisão de persistência: o comportamento existente pode confirmar sucesso sem gravação durável. Não foram enviados leads de teste para o banco.
- Nenhum deploy ou substituição de main foi feito nesta integração.
