export type LegalDoc = {
  titulo: string;
  versao: string;
  resumo: string;
  secoes: { titulo: string; texto: string }[];
  outro: { href: string; label: string };
};

export const termsOfUse: LegalDoc = {
  titulo: "Termos de uso",
  versao: "Versão de 1º de setembro de 2026",
  resumo:
    "Em resumo: o Guará só lê seus dados, você controla as conexões e pode apagar tudo quando quiser.",
  secoes: [
    {
      titulo: "1. O que é o Guará",
      texto:
        "Um app que organiza suas finanças pessoais a partir dos dados que você autoriza pelo Open Finance e do que você cadastra. O Guará só lê dados: não movimenta dinheiro, não faz pagamentos e não pede a senha do seu banco.",
    },
    {
      titulo: "2. Sua conta",
      texto:
        "Você precisa ter 18 anos ou mais e manter seus dados de acesso em segurança. Pode excluir a conta quando quiser em Meu perfil.",
    },
    {
      titulo: "3. Conexão com bancos",
      texto:
        "A conexão é feita pelo Malvo, instituição autorizada pelo Banco Central, dentro do Open Finance Brasil. Cada autorização vale por até 12 meses e pode ser revogada no Guará ou no app do banco.",
    },
    {
      titulo: "4. Assistentes de IA",
      texto:
        "Os assistentes respondem com base nos seus dados e podem errar. As respostas são informativas e não são recomendação de investimento, consultoria financeira ou jurídica.",
    },
    {
      titulo: "5. Planos e pagamento",
      texto:
        "O plano Essencial é gratuito. Os planos Completo e Ampliado são assinaturas mensais ou anuais, renovadas automaticamente até você cancelar. Ao cancelar, o acesso pago vale até o fim do período já pago.",
    },
    {
      titulo: "6. Limites de responsabilidade",
      texto:
        "Cotações e dados de mercado vêm de terceiros, com possível atraso. Decisões de investimento são sempre suas.",
    },
    {
      titulo: "7. Mudanças nestes termos",
      texto:
        "Avisamos por e-mail e no app com 30 dias de antecedência sempre que algo importante mudar.",
    },
  ],
  outro: { href: "/privacidade", label: "Política de privacidade" },
};

export const privacyPolicy: LegalDoc = {
  titulo: "Política de privacidade",
  versao: "Versão de 1º de setembro de 2026",
  resumo:
    "Em resumo: usamos seus dados só para o app funcionar para você. Nada é vendido, e você pode baixar ou apagar tudo.",
  secoes: [
    {
      titulo: "O que coletamos",
      texto:
        "Dados de cadastro (nome e e-mail), dados financeiros que você autoriza pelo Open Finance (saldos, lançamentos, cartões e investimentos), o que você cadastra à mão e as conversas com os assistentes.",
    },
    {
      titulo: "Para que usamos",
      texto:
        "Para organizar seus gastos, calcular tetos e metas, acompanhar investimentos, enviar os avisos que você escolheu e responder suas perguntas. Não vendemos seus dados e não usamos para anúncios.",
    },
    {
      titulo: "Com quem compartilhamos",
      texto:
        "Com o Malvo, para a conexão com os bancos; com a Brapi, só o código dos ativos para buscar cotações; e com o provedor de IA, apenas o necessário para responder cada pergunta, sem uso para treinar modelos.",
    },
    {
      titulo: "Por quanto tempo guardamos",
      texto:
        "Enquanto sua conta existir. Arquivos enviados no chat são apagados em 30 dias. Ao excluir a conta, apagamos seus dados em até 30 dias, salvo o que a lei obriga a guardar.",
    },
    {
      titulo: "Seus direitos (LGPD)",
      texto:
        "Você pode acessar, corrigir, baixar e apagar seus dados, além de revogar autorizações, em Meu perfil › Segurança e privacidade, ou pelo e-mail privacidade@guara.app.",
    },
    {
      titulo: "Segurança",
      texto:
        "Dados criptografados em trânsito e armazenados com criptografia. Tokens do Open Finance ficam protegidos e nunca aparecem nos registros.",
    },
  ],
  outro: { href: "/termos", label: "Termos de uso" },
};
