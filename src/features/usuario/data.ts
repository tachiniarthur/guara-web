/** Usuário de exemplo dos protótipos (ainda não há API). */
export const user = {
  nome: "Arthur",
  nomeCompleto: "Arthur Rocha",
  iniciais: "AR",
  email: "arthur@exemplo.com",
  /** Celular em E.164, como a API guarda. */
  telefone: "+5511987654321",
  bancosConectados: 2,
  bancosDoPlano: 4,
  notificacoesNovas: 3,
};

export const bancosResumo = `${user.bancosConectados} de ${user.bancosDoPlano} bancos conectados`;
