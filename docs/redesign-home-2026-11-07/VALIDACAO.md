# Validação — home Sites Lopes

## Preservação
- ScrollVideoHero.tsx idêntico ao HEAD: SHA256 b39d5da07731087248671d4bae439d570f84ef40bc99ff016db686b5ef0a6550.
- Todas as regras anteriores da abertura e navegação permanecem no home-design-preview.css, inclusive medidas desktop/celular e recorte. Nenhum ativo de vídeo, logo ou abertura foi substituído.
- Manrope e novas regras estão limitadas ao corpo posterior e ao rodapé da home. LP Bauhaus e demais rotas preservadas.
- Fontes originais Logic/LAVIERDOR/_MODELO não foram modificadas; template retido foi copiado para uma pasta temporária de referência, sem identidade nova de hospedagem ou bindings.

## Verificações realizadas
- Build de produção gera 48 páginas e sitemap com 33 URLs elegíveis.
- Typecheck específico do Signature e sete testes de SEO: aprovados.
- Capturas desktop 1440x1000, mobile 390x844 e largura de usuário 1280x900, com todas as capas carregadas, sem imagens quebradas ou overflow horizontal.
- Busca por termo sem resultado apresenta estado vazio; limpar filtros restaura seis destaques.
- FAQ abre pelo controle nativo.
- Prévia local bloqueia writes com 503: erro de contato aparece e conserva o nome digitado. Nenhum lead de teste enviado ao banco/CRM; sucesso real em produção não foi testado.
- SSR sem propriedades/taxonomias: atalho de bairros aponta para /imoveis; seção sem estoque é omitida; Journal vazio omitido; contato não promete assinatura de newsletter.
- Detector Impeccable executado uma vez. Aviso de nova fonte resolvido por documentação explícita de Manrope e escopo no DESIGN.md/sidecar, sem supressões. Demais avisos são valores locais do sistema solicitado.

## Revisão independente
Revisão final identificou dois ajustes materiais: fallback do atalho de bairros sem estoque e documentação do escopo/Manrope. Ambos foram pontuados resolved no verdict pass, disposition ship. Não foi observado outro problema visual material no primeiro escopo revisado; o verdict pass cobre os dois ajustes, não uma nova aprovação integral do site. Fidelidade visual diretamente conferida contra LAVIERDOR, sem alegar equivalência pixel a pixel a Logic/_MODELO.

## Limites e pendências mantidas
- Typecheck global do monorepo continua com conflito local Vite 7.3.1/7.3.6 no mockup-sandbox, ligado à estrutura local pré-existente de dependências. Não foi apresentado como aprovado.
- Migração editorial e atualização automática do HTML após mudanças no banco continuam pendentes de acesso/configuração; o redesign não muda esse backend.
- Rotas Sobre/Contato/Especialistas/Journal foram analisadas, mas o redesign solicitado foi aplicado às seções da home. Copy antiga de atendimento VIP/horários/promessa de resposta da rota Contato foi registrada na análise para revisão própria.
