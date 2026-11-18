# Contexto do Guará: índice

Documentação de contexto levantada por leitura do código em 16/11/2026 (nada foi alterado no código).
**Sempre confira o código atual antes de implementar**: estes arquivos são mapa, não fonte da verdade.

| Arquivo                                                        | Conteúdo                                                                          |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [01-visao-geral.md](01-visao-geral.md)                         | Os projetos, tecnologias, como se relacionam, modo protótipo × modo real          |
| [02-web-rotas.md](02-web-rotas.md)                             | Estrutura de `src/`, layouts, navegação, as 76 páginas e o que é real             |
| [03-componentes.md](03-componentes.md)                         | Componentes compartilhados, estados de tela, identidade visual, estilos           |
| [04-integracao-api.md](04-integracao-api.md)                   | API (NestJS): arquitetura, auth, contrato de erro, endpoints × telas do Web       |
| [05-fluxos-de-dados.md](05-fluxos-de-dados.md)                 | Fluxos: sessão, telas com dados reais, formulários, layout, cache                 |
| [06-padroes.md](06-padroes.md)                                 | Convenções, comandos, testes, lint, commits                                       |
| [07-pontos-de-atencao.md](07-pontos-de-atencao.md)             | Inconsistências, particularidades e o que não foi confirmado                      |
| [08-funcionalidades-futuras.md](08-funcionalidades-futuras.md) | Telas desenhadas que voltam quando a API tiver o dado (não remover sem registrar) |

Docs que já existiam e **não são duplicadas aqui**: `docs/ux/README.md` (movimento, tokens de
animação, inventário de telas, revisão de UX), `docs/performance.md` (telas geradas no build),
`CLAUDE.md` (regras do editor de layout, gráficos, breadcrumbs). Na API: `guara-api/CLAUDE.md` e
`guara-api/docs/architecture.md`.
