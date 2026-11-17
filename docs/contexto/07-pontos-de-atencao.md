# 7. Pontos de atenção

## Inconsistências e particularidades (confirmadas no código)

1. **App híbrido**: protótipo e real convivem. Desde 17/11/2026 todas as abas do menu (Início, Gastos, Assinaturas,
   Investimentos, Simulador, Metas, Relatórios, Alertas) leem a API com login. **Início, Gastos (lista, lançamento,
   categoria, projeção), Assinaturas e o chat não têm mais dados de exemplo (17/11/2026)**: sem as variáveis ou com a API
   fora, mostram o estado de erro; carregando, os cards guardam o lugar com "—" (`EMPTY_GASTOS`, `EMPTY_LANCAMENTOS`,
   `LOADING_SUMMARY`…). Ainda com dados de exemplo: bens, página do ativo, metas/[id] e nova, notificações, editar
   alertas/tetos e as telas de tetos (`features/gastos/prototype.ts`, só para Alertas). Antes de mexer, confirme se a tela
   usa `live`/context ou `data.ts`.
2. **Dependências instaladas e não usadas** (0 imports em `src/`): `react-hook-form`, `@hookform/resolvers`, `recharts`,
   `lucide-react`, `shadcn` (só o CSS `shadcn/tailwind.css` é importado); `d3-geo`/`topojson-client`/`world-atlas` só servem ao
   script `scripts/generate-globe-dots.mjs`. `tw-animate-css` é importado só no CSS. `components.json` (shadcn, `base-nova`) existe,
   mas `components/ui` é **todo próprio**; o README ainda diz "reservada para o shadcn". Não presumir essas libs.
3. **Duas formas de usar o mesmo dado**: `data.ts` × `live.ts` com Context. Telas de edição/criação costumam ser protótipo mesmo
   quando a listagem é real (ex.: tetos, metas, alertas editar).
4. **Assistente único (16/11/2026)**: Web e API têm só o Lobo Guará. Na API saíram o catálogo de assistentes, o
   encaminhamento (`call_assistant`), a `@menção`, `GET /v1/chat/assistants`, `PUT /v1/me/plan/assistants`, `assistants` e
   `limits.specialists` do plano e `assistant`/`calledBy` das mensagens (migração `0040_single_assistant`). O SSE não tem mais
   o evento `assistant`; `tool` vem como `{ name }`. A etapa de onboarding `assistants_and_channels` virou `notification_channels`.
5. **Chat real (17/11/2026)**: `features/conversas/api.ts` (conversas, mensagens, busca, renomear/excluir) e `stream.ts`
   (envio com SSE, `readSse`; turno pendente em zustand, parar a resposta com `AbortController`). A conversa só é criada
   na primeira pergunta (`/conversas` = nova; o endereço vira `/conversas/<uuid>`). O conteúdo nunca vai para o
   `localStorage` (chaves `["chat",…]` fora do `query-persist`). Erros da API aparecem na mensagem não enviada
   (429 limite de IA, 403 plano, 409 já respondendo). Anexo, microfone, fixar/compartilhar/exportar foram removidos (sem API).
6. **Configurações** só em `localStorage` (a API tem `/me/notification-settings` e `/me/devices`, não usados). A
   simulação de aposentadoria salva também fica no navegador (a API pede idade atual e de aposentadoria).
7. **Badge de Alertas**: `2` em `lib/navigation.ts` é do protótipo; com login, barra lateral, inferior e menu da conta
   usam as não lidas da API. `OFFLINE_NOTE` ("dados de hoje, 14:30") é texto fixo do protótipo.
8. **`apiRequest` lê 204** (excluir simulação) e **`schema.parse` lança** se a API mudar o formato; as telas isolam isso
   com `buildView`. Percentuais vêm como string (`apiPercent`). O layout continua sem chamar `DELETE` (grava o padrão).
9. **Layout editor**: largura editável, altura não (decisão de 17/11/2026; o app mobile ainda edita a altura); campo novo no bloco salvo → publicar API antes (`strictObject`, 422).
10. **Rotas estáticas**: ler `searchParams` em `page.tsx` torna a rota dinâmica e piora a navegação (ver `docs/performance.md`);
    estados do protótipo (`?estado=`, hoje só Investimentos, Metas, Relatório e Alertas) passam pelo `proxy.ts` + `/previa`.
    `generateStaticParams` usa ids do protótipo nas telas que ainda têm; `conversas/[id]`, `assinaturas/[id]` e as de
    Gastos são dinâmicas.
11. **API de teste dorme**: login espera até 60 s; plano tem 6 retries; primeiro load pode demorar.
12. **Plano**: `POST /me/plan` só funciona onde `ALLOW_PLAN_SELF_SERVICE=true`; em produção a API recusa (cobrança ainda inexistente).
13. **Nomes**: README do Web cita `api/` e `mobile/` ao lado; hoje a pasta é `guara-api/`. `CLAUDE.md` cita `apps/mobile`, que não existe aqui.
14. **Banco de teste (`GuaraDados`, Supabase)**: migrações até a `0040` aplicadas em 16/11/2026 (o `pnpm db:migrate` é manual,
    não roda no deploy do Render). O plano gratuito **pausa o projeto por inatividade**: o Render cai com
    `tenant/user postgres.<ref> not found` até alguém restaurar o projeto no painel do Supabase.
15. **Usuários do banco de teste**: desde 16/11/2026 são só as 9 personas fictícias (`@guara.test`, senha `guara-dev-123`; veja
    "Contas de teste" em `04-integracao-api.md`). As contas reais anteriores foram apagadas; cópia dos dados antigos só na máquina
    de quem rodou o seed. O CPF das personas fica vazio no remoto (`cpfMasked: null`).
16. `.env` e `tsconfig.tsbuildinfo existem na pasta do Web, mas estão no `.gitignore`(não li o`.env`).

## Não confirmado / não explorado

- As abas do menu foram conferidas no navegador com a persona Marina em 17/11/2026 (Playwright, site local apontando para a
  API de teste). As outras telas seguem classificadas por leitura de imports/chamadas.
- **Relatório**: o saldo dia a dia é estimado (saldo de hoje das contas menos o que entrou e saiu depois); a previsão do mês
  usa o gasto médio por dia, sem novas entradas. Os maiores movimentos saem dos 100 lançamentos mais recentes do período.
- **Exportação**: depende do worker da API (fila). Sem worker, o pedido fica "Na fila" e o aviso não chega.
- Schemas de resposta completos de cada endpoint: estão nos `live*.ts` (parciais, `.loose()`) e em `guara-api/src/shared/schemas`; não
  transcrevi todos.
- Se `perfil/planos`, `notificacoes` e `excluir-conta` fazem alguma chamada além das listadas (grep mostra só `/me/plan` e `/me`).
- Regras de negócio profundas da API (detectores de anomalia/assinatura, cálculo de metas, alocação): só os nomes dos módulos.
- Fluxo de Open Finance (Malvo) no Web: telas existem, sem integração.
- `docs/ux/README.md` tem inventário de telas e revisão de UX com pendências próprias; não reproduzido aqui.
- Testes da API não foram executados; e2e exige Supabase/Redis locais.
