import type { Risk } from "@/features/investimentos/data";

export type IndicatorRow = {
  nome: "Rentabilidade" | "CDI" | "Excesso (p.p.)" | "Volatilidade anualizada" | "Sharpe";
  /** Valores por período: no mês, no ano, 3M, 6M, 12M, 36M, 60M, desde o início. */
  valores: string[];
};

export const indicatorPeriods = [
  "No mês",
  "No ano",
  "3M",
  "6M",
  "12M",
  "36M",
  "60M",
  "Desde o início",
];

export const indicatorHints: Record<IndicatorRow["nome"], string> = {
  Rentabilidade: "Quanto o ativo rendeu no período.",
  CDI: "Referência da renda fixa no mesmo período.",
  "Excesso (p.p.)": "Diferença entre a rentabilidade do ativo e o CDI.",
  "Volatilidade anualizada": "Quanto o preço oscila. Quanto maior, mais arriscado.",
  Sharpe: "Retorno acima do CDI para cada unidade de risco. Acima de 0 é melhor que o CDI.",
};

const cdiRow: IndicatorRow = {
  nome: "CDI",
  valores: ["+0,9%", "+10,4%", "+3,4%", "+6,9%", "+14,2%", "+44,1%", "+79,8%", "—"],
};

export type CorporateEvent = { data: string; evento: string; valor: string; recebido?: string };

export type EventsInfo =
  | { tipo: "mensagem"; subtitulo: string; texto: string }
  | {
      tipo: "tabela";
      subtitulo: string;
      resumo: string;
      eventos: CorporateEvent[];
      total: number;
      nota: string;
      /** Texto curto no mobile quando não recebeu ("você não tinha"). */
      semRecebimento?: string;
    };

type AssetCommon = {
  slug: string;
  nome: string;
  badge: { texto: string; cor: string; fonte: number; fonteMobile?: number };
  tag: string;
  indicadores: IndicatorRow[];
  notaIndicadores: string;
  eventos: EventsInfo;
};

export type DetailRow = { rotulo: string; valor: string; dica?: string };

/** Ativos comparados ao CDI (fundos, renda fixa, cripto). */
export type ComparedAsset = AssetCommon & {
  modelo: "comparado";
  origem: { tipo: "br" | "global"; texto: string };
  subtitulo: string;
  criarAlerta: boolean;
  precoAjustado: boolean;
  destaque: {
    /** "preco": valor em areia e variação em verde · "rentabilidade": valor em verde, p.p. em verde. */
    tipo: "preco" | "rentabilidade";
    rotulo: string;
    valor: string;
    /** Linha de variação: primeira parte (verde) e segunda (névoa). */
    variacao: [string, string];
  };
  taxas: { custo: string; legenda: string; itens: DetailRow[] };
  detalhes: { linhas: DetailRow[]; risco: Risk; nota: string };
  posicao: { linhas: (DetailRow & { vazio?: boolean })[]; nota: string };
  perguntas: string[];
};

export type RangeInfo = {
  titulo: string;
  subtitulo: string;
  subtituloCurto: string;
  min: string;
  max: string;
  posicao: number;
  label: string;
  linhas: DetailRow[];
};

/** Ação (detalhe com cotação, proventos e dados da empresa). */
export type StockAsset = AssetCommon & {
  modelo: "acao";
  empresa: string;
  preco: { valor: string; variacao: string; atualizado: string };
  posicao: {
    desde: string;
    resultado: string;
    resultadoPct: string;
    linhas: DetailRow[];
    alerta: { titulo: string; texto: string };
  };
  hoje: RangeInfo;
  semanas: RangeInfo;
  fundamentos: DetailRow[];
  proventos: {
    subtitulo: string;
    barras: { rotulo: string; valor: number }[];
    lista: { titulo: string; data: string; valor: string; legenda: string; recebeu: boolean }[];
  };
  empresaInfo: { linhas: DetailRow[]; descricao: string };
};

export type Asset = ComparedAsset | StockAsset;

const classeHint =
  "Grupo usado na sua alocação: Renda fixa, Renda variável, Imobiliário, Multimercado, Alternativos ou Caixa.";
const instrumentoHint =
  "O tipo de papel: Título público, CDB, Ação, ETF, Fundo imobiliário, Criptomoeda, COE, Fiagro ou FI-Infra.";

const noAveragePrice =
  'Preço médio não informado. Adicione em "Editar posição" para ver seu resultado.';

export const assets: Record<string, Asset> = {
  petr4: {
    modelo: "acao",
    slug: "petr4",
    nome: "PETR4",
    badge: { texto: "BR", cor: "#0F5C3A", fonte: 20, fonteMobile: 17 },
    tag: "Ações · B3",
    empresa: "Petrobras PN · Petróleo Brasileiro S.A.",
    preco: {
      valor: "R$ 37,82",
      variacao: "R$ 0,43 (−1,12%) hoje",
      atualizado: "Atualizado às 14:30",
    },
    posicao: {
      desde: "Cadastro manual em 12/03/2026",
      resultado: "+R$ 544,00",
      resultadoPct: "(+7,7%)",
      linhas: [
        { rotulo: "Quantidade", valor: "200 ações" },
        { rotulo: "Preço médio", valor: "R$ 35,10" },
        { rotulo: "Investido", valor: "R$ 7.020,00" },
        { rotulo: "Vale hoje", valor: "R$ 7.564,00" },
        { rotulo: "Peso na carteira", valor: "15,7%" },
        { rotulo: "Origem", valor: "Cadastro manual" },
      ],
      alerta: { titulo: "Alerta de compra ativo", texto: "Quando cair a R$ 34,00 · faltam 10,1%" },
    },
    hoje: {
      titulo: "Hoje",
      subtitulo: "Pregão de 23 de setembro",
      subtituloCurto: "23 de setembro",
      min: "Mín. R$ 37,55",
      max: "Máx. R$ 38,31",
      posicao: 35.5,
      label: "Faixa do dia: mínima R$ 37,55, máxima R$ 38,31, agora R$ 37,82",
      linhas: [
        { rotulo: "Abertura", valor: "R$ 38,10" },
        { rotulo: "Fechamento anterior", valor: "R$ 38,25" },
        { rotulo: "Volume", valor: "38,4 milhões" },
      ],
    },
    semanas: {
      titulo: "52 semanas",
      subtitulo: "Mínima e máxima do último ano",
      subtituloCurto: "Mínima e máxima do ano",
      min: "Mín. R$ 30,12",
      max: "Máx. R$ 42,50",
      posicao: 62.2,
      label: "Faixa de 52 semanas: mínima R$ 30,12, máxima R$ 42,50, agora R$ 37,82",
      linhas: [
        { rotulo: "Distância da máxima", valor: "−11,0%" },
        { rotulo: "Distância da mínima", valor: "+25,6%" },
        { rotulo: "Variação em 12 meses", valor: "+9,4%" },
      ],
    },
    fundamentos: [
      { rotulo: "Valor de mercado", valor: "R$ 492,8 bi" },
      { rotulo: "P/L (preço / lucro)", valor: "5,1" },
      { rotulo: "LPA (lucro por ação)", valor: "R$ 7,41" },
      { rotulo: "Dividend yield (12 meses)", valor: "12,3%" },
    ],
    proventos: {
      subtitulo: "Por ação, nos últimos 2 anos · dividend yield de 12,3%",
      barras: [
        { rotulo: "out/24", valor: 1.05 },
        { rotulo: "jan/25", valor: 0.95 },
        { rotulo: "mai/25", valor: 1.12 },
        { rotulo: "ago/25", valor: 0.74 },
        { rotulo: "nov/25", valor: 0.48 },
        { rotulo: "fev/26", valor: 0.86 },
        { rotulo: "mai/26", valor: 0.64 },
        { rotulo: "ago/26", valor: 0.72 },
      ],
      lista: [
        {
          titulo: "Dividendos · R$ 0,72 por ação",
          data: "Pago em 20/08/2026",
          valor: "+R$ 144,00",
          legenda: "você recebeu",
          recebeu: true,
        },
        {
          titulo: "JCP · R$ 0,64 por ação",
          data: "Pago em 20/05/2026",
          valor: "+R$ 128,00",
          legenda: "você recebeu",
          recebeu: true,
        },
        {
          titulo: "Dividendos · R$ 0,86 por ação",
          data: "Pago em 20/02/2026",
          valor: "—",
          legenda: "antes da sua compra",
          recebeu: false,
        },
      ],
    },
    empresaInfo: {
      linhas: [
        { rotulo: "Setor", valor: "Energia" },
        { rotulo: "Segmento", valor: "Petróleo, gás e biocombustíveis" },
        { rotulo: "Tipo", valor: "Ação preferencial (PN)" },
        { rotulo: "Site", valor: "petrobras.com.br" },
      ],
      descricao:
        "Empresa de energia de capital aberto com controle da União. Atua em exploração e produção de petróleo e gás, refino, logística e comercialização de combustíveis no Brasil e no exterior.",
    },
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+2,3%", "+8,9%", "+5,6%", "+2,2%", "+21,7%", "+58,4%", "+210,5%", "—"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["+1,4%", "−1,5%", "+2,2%", "−4,7%", "+7,5%", "+14,3%", "+130,7%", "—"],
      },
      {
        nome: "Volatilidade anualizada",
        valores: ["24,1%", "26,8%", "25,2%", "26,0%", "26,3%", "29,4%", "33,1%", "—"],
      },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "0,29", "0,12", "0,39", "—"] },
    ],
    notaIndicadores: "Inclui dividendos e JCP reinvestidos.",
    eventos: {
      tipo: "tabela",
      subtitulo: "Proventos · valores por ação",
      resumo: "Últimos 12 meses: R$ 2,70 por ação",
      eventos: [
        { data: "20/08/2026", evento: "Dividendos", valor: "R$ 0,7200", recebido: "+R$ 144,00" },
        { data: "20/05/2026", evento: "JCP", valor: "R$ 0,6400", recebido: "+R$ 128,00" },
        { data: "20/02/2026", evento: "Dividendos", valor: "R$ 0,8600" },
        { data: "20/11/2025", evento: "Dividendos", valor: "R$ 0,4800" },
        { data: "20/08/2025", evento: "Dividendos", valor: "R$ 0,7400" },
        { data: "20/05/2025", evento: "JCP", valor: "R$ 1,1200" },
        { data: "20/01/2025", evento: "Dividendos", valor: "R$ 0,9500" },
        { data: "20/10/2024", evento: "Dividendos", valor: "R$ 1,0500" },
      ],
      total: 64,
      nota: '"—" em Você recebeu: você ainda não tinha a ação na data com (comprou em 12/03/2026).',
      semRecebimento: "você não tinha",
    },
  },

  "tesouro-selic-2029": {
    modelo: "comparado",
    slug: "tesouro-selic-2029",
    nome: "Tesouro Selic 2029",
    badge: { texto: "TD", cor: "#1F4A6E", fonte: 20 },
    tag: "Renda fixa · Tesouro Direto",
    origem: { tipo: "br", texto: "BRA" },
    subtitulo: "Tesouro Nacional · título público federal",
    criarAlerta: false,
    precoAjustado: false,
    destaque: {
      tipo: "rentabilidade",
      rotulo: "Rentabilidade em 12 meses",
      valor: "+14,32%",
      variacao: ["101,2% do CDI", "+0,17 p.p."],
    },
    taxas: {
      custo: "0,07%",
      legenda: "ao ano, sobre o seu saldo atual",
      itens: [
        {
          rotulo: "Taxa de custódia da B3",
          valor: "0,20% ao ano só sobre o que passar de R$ 10 mil",
        },
        { rotulo: "Taxa da instituição", valor: "—" },
        {
          rotulo: "Imposto de renda",
          valor: "Tabela regressiva: de 22,5% a 15%, conforme o tempo aplicado",
        },
        { rotulo: "IOF", valor: "Só em resgates nos primeiros 30 dias" },
      ],
    },
    detalhes: {
      linhas: [
        { rotulo: "Nome", valor: "Tesouro Selic 2029" },
        { rotulo: "Classe", valor: "Renda fixa", dica: classeHint },
        { rotulo: "Instrumento", valor: "Título público", dica: instrumentoHint },
        { rotulo: "Emissor", valor: "Tesouro Nacional" },
        { rotulo: "Indexador", valor: "Selic (pós-fixado)" },
        { rotulo: "Vencimento", valor: "01/03/2029" },
      ],
      risco: "Baixo",
      nota: "Liquidez diária · garantido pelo Tesouro Nacional",
    },
    posicao: {
      linhas: [
        { rotulo: "Valor hoje", valor: "R$ 15.892,10" },
        { rotulo: "% da carteira", valor: "32,9%" },
        { rotulo: "Quantidade", valor: "—", vazio: true },
        { rotulo: "Preço médio", valor: "—", vazio: true },
        { rotulo: "Origem", valor: "Itaú · Open Finance" },
        { rotulo: "Atualização", valor: "Automática" },
      ],
      nota: "Atualizado automaticamente pelo Open Finance.",
    },
    perguntas: [
      "Qual papel o Tesouro Selic 2029 tem na minha carteira?",
      "Vale a pena manter o Tesouro Selic como reserva?",
      "O que acontece se eu resgatar antes de 2029?",
    ],
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+0,9%", "+10,5%", "+3,4%", "+7,0%", "+14,3%", "+44,6%", "+80,5%", "—"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["0,0%", "+0,1%", "0,0%", "+0,1%", "+0,1%", "+0,5%", "+0,7%", "—"],
      },
      {
        nome: "Volatilidade anualizada",
        valores: ["0,1%", "0,2%", "0,1%", "0,2%", "0,2%", "0,3%", "0,3%", "—"],
      },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "0,50", "0,43", "0,29", "—"] },
    ],
    notaIndicadores: "Título pós-fixado: acompanha a Selic de perto.",
    eventos: {
      tipo: "mensagem",
      subtitulo: "Dividendos, rendimentos e outros pagamentos",
      texto:
        "O Tesouro Selic 2029 não paga juros durante o caminho. Todo o rendimento é recebido no resgate ou no vencimento, em 01/03/2029.",
    },
  },

  "cdb-110-cdi": {
    modelo: "comparado",
    slug: "cdb-110-cdi",
    nome: "CDB 110% CDI",
    badge: { texto: "CDB", cor: "#3A2A5E", fonte: 15 },
    tag: "Renda fixa · CDB",
    origem: { tipo: "br", texto: "BRA" },
    subtitulo: "Nubank · pós-fixado · garantido pelo FGC",
    criarAlerta: false,
    precoAjustado: false,
    destaque: {
      tipo: "rentabilidade",
      rotulo: "Rentabilidade em 12 meses",
      valor: "+15,57%",
      variacao: ["110,0% do CDI", "+1,42 p.p."],
    },
    taxas: {
      custo: "0,00%",
      legenda: "CDB não cobra taxa de administração",
      itens: [
        { rotulo: "Taxa de administração", valor: "Não tem" },
        {
          rotulo: "Imposto de renda",
          valor: "Tabela regressiva: de 22,5% a 15%, conforme o tempo aplicado",
        },
        { rotulo: "IOF", valor: "Só em resgates nos primeiros 30 dias" },
        { rotulo: "Garantia", valor: "FGC até R$ 250 mil por CPF e instituição" },
      ],
    },
    detalhes: {
      linhas: [
        { rotulo: "Nome", valor: "CDB Nubank 110% do CDI" },
        { rotulo: "Classe", valor: "Renda fixa", dica: classeHint },
        { rotulo: "Instrumento", valor: "CDB", dica: instrumentoHint },
        { rotulo: "Emissor", valor: "Nubank" },
        { rotulo: "Indexador", valor: "110% do CDI" },
        { rotulo: "Vencimento", valor: "15/03/2027" },
      ],
      risco: "Baixo",
      nota: "Coberto pelo FGC até R$ 250 mil por CPF e instituição",
    },
    posicao: {
      linhas: [
        { rotulo: "Valor hoje", valor: "R$ 6.330,00" },
        { rotulo: "% da carteira", valor: "13,1%" },
        { rotulo: "Quantidade", valor: "—", vazio: true },
        { rotulo: "Preço médio", valor: "—", vazio: true },
        { rotulo: "Origem", valor: "Nubank · Open Finance" },
        { rotulo: "Atualização", valor: "Automática" },
      ],
      nota: "Atualizado automaticamente pelo Open Finance.",
    },
    perguntas: [
      "Qual papel o CDB 110% CDI tem na minha carteira?",
      "Esse CDB rende mais que o Tesouro Selic?",
      "Posso resgatar antes do vencimento?",
    ],
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+1,0%", "+11,4%", "+3,7%", "+7,6%", "+15,6%", "—", "—", "+17,8%"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["+0,1%", "+1,0%", "+0,3%", "+0,7%", "+1,4%", "—", "—", "—"],
      },
      { nome: "Volatilidade anualizada", valores: ["—", "—", "—", "—", "—", "—", "—", "—"] },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "—", "—", "—", "—"] },
    ],
    notaIndicadores:
      'CDB não tem cotação diária, por isso não há volatilidade nem Sharpe. "Desde o início" conta a partir da sua aplicação, em mar/2025.',
    eventos: {
      tipo: "mensagem",
      subtitulo: "Dividendos, rendimentos e outros pagamentos",
      texto:
        "Este CDB não paga juros periódicos. O rendimento é pago de uma vez no vencimento, em 15/03/2027, ou se você resgatar antes.",
    },
  },

  bova11: {
    modelo: "comparado",
    slug: "bova11",
    nome: "BOVA11",
    badge: { texto: "ETF", cor: "#0F5C3A", fonte: 15 },
    tag: "Renda variável · ETF · B3",
    origem: { tipo: "br", texto: "BRA" },
    subtitulo: "iShares Ibovespa · gestão BlackRock",
    criarAlerta: true,
    precoAjustado: true,
    destaque: {
      tipo: "preco",
      rotulo: "Preço da cota",
      valor: "R$ 125,10",
      variacao: ["R$ 13,80 ▲ (12,40%)", "87,6% do CDI (−1,75 p.p.)"],
    },
    taxas: {
      custo: "0,10%",
      legenda: "ao ano (taxa de administração)",
      itens: [
        { rotulo: "Taxa de administração", valor: "0,10% ao ano" },
        {
          rotulo: "Imposto de renda",
          valor: "15% sobre o lucro na venda, sem isenção de R$ 20 mil",
        },
        { rotulo: "Corretagem", valor: "Depende da sua corretora" },
        { rotulo: "Onde negocia", valor: "B3, em horário de pregão" },
      ],
    },
    detalhes: {
      linhas: [
        { rotulo: "Nome", valor: "iShares Ibovespa Fundo de Índice" },
        { rotulo: "Classe", valor: "Renda variável", dica: classeHint },
        { rotulo: "Instrumento", valor: "ETF", dica: instrumentoHint },
        { rotulo: "Gestor", valor: "BlackRock" },
        { rotulo: "Índice", valor: "Ibovespa" },
      ],
      risco: "Médio",
      nota: "Replica o Ibovespa · negociado na B3",
    },
    posicao: {
      linhas: [
        { rotulo: "Quantidade", valor: "25 cotas" },
        { rotulo: "Preço médio", valor: "—", vazio: true },
        { rotulo: "Valor hoje", valor: "R$ 3.127,50" },
        { rotulo: "% da carteira", valor: "6,5%" },
        { rotulo: "Origem", valor: "Cadastro manual" },
        { rotulo: "Atualização", valor: "12/09" },
      ],
      nota: noAveragePrice,
    },
    perguntas: [
      "Qual papel o BOVA11 tem na minha carteira?",
      "BOVA11 é uma boa forma de investir no Ibovespa?",
      "Quanto do meu patrimônio está em renda variável?",
    ],
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+2,1%", "+9,8%", "+4,1%", "+6,5%", "+12,4%", "+31,2%", "+38,5%", "—"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["+1,2%", "−0,6%", "+0,7%", "−0,4%", "−1,8%", "−12,9%", "−41,3%", "—"],
      },
      {
        nome: "Volatilidade anualizada",
        valores: ["16,2%", "17,9%", "15,8%", "17,1%", "18,4%", "19,6%", "21,3%", "—"],
      },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "−0,10", "−0,18", "−0,27", "—"] },
    ],
    notaIndicadores: "Preço ajustado. O ETF reinveste os dividendos das empresas do índice.",
    eventos: {
      tipo: "mensagem",
      subtitulo: "Dividendos, rendimentos e outros pagamentos",
      texto:
        "O BOVA11 não distribui dividendos. Os proventos das empresas do Ibovespa são reinvestidos no próprio fundo e aparecem no preço da cota.",
    },
  },

  hglg11: {
    modelo: "comparado",
    slug: "hglg11",
    nome: "HGLG11",
    badge: { texto: "FII", cor: "#6A4428", fonte: 15 },
    tag: "Imobiliário · FII · B3",
    origem: { tipo: "br", texto: "BRA" },
    subtitulo: "Pátria Log · galpões logísticos",
    criarAlerta: true,
    precoAjustado: true,
    destaque: {
      tipo: "preco",
      rotulo: "Preço da cota",
      valor: "R$ 161,30",
      variacao: ["R$ 10,30 ▲ (6,82%)", "48,2% do CDI (−7,33 p.p.)"],
    },
    taxas: {
      custo: "—",
      legenda: "a fonte de dados não informa a taxa deste fundo",
      itens: [
        { rotulo: "Taxa de administração", valor: "— (não informada pela fonte)" },
        {
          rotulo: "Rendimentos mensais",
          valor: "Isentos de IR para pessoa física, dentro das regras",
        },
        { rotulo: "Imposto na venda", valor: "20% sobre o lucro" },
        { rotulo: "Onde negocia", valor: "B3, em horário de pregão" },
      ],
    },
    detalhes: {
      linhas: [
        { rotulo: "Nome", valor: "Pátria Log FII" },
        { rotulo: "Classe", valor: "Imobiliário", dica: classeHint },
        { rotulo: "Instrumento", valor: "Fundo imobiliário", dica: instrumentoHint },
        { rotulo: "Gestor", valor: "Pátria Investimentos" },
        { rotulo: "Segmento", valor: "Galpões logísticos" },
      ],
      risco: "Médio",
      nota: "Paga rendimentos todo mês · negociado na B3",
    },
    posicao: {
      linhas: [
        { rotulo: "Quantidade", valor: "42 cotas" },
        { rotulo: "Preço médio", valor: "—", vazio: true },
        { rotulo: "Valor hoje", valor: "R$ 6.774,60" },
        { rotulo: "% da carteira", valor: "14,0%" },
        { rotulo: "Origem", valor: "Cadastro via chat" },
        { rotulo: "Atualização", valor: "18/09" },
      ],
      nota: noAveragePrice,
    },
    perguntas: [
      "Qual papel o HGLG11 tem na minha carteira?",
      "Os rendimentos do HGLG11 estão estáveis?",
      "Quais são os riscos de um FII de galpões?",
    ],
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+1,3%", "+9,4%", "+2,8%", "+5,1%", "+15,0%", "+33,0%", "+42,7%", "—"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["+0,4%", "−1,0%", "−0,6%", "−1,8%", "+0,8%", "−11,1%", "−37,1%", "—"],
      },
      {
        nome: "Volatilidade anualizada",
        valores: ["9,4%", "10,2%", "9,8%", "10,5%", "10,8%", "11,9%", "12,6%", "—"],
      },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "0,07", "−0,25", "−0,40", "—"] },
    ],
    notaIndicadores: "Inclui os rendimentos mensais pagos no período.",
    eventos: {
      tipo: "tabela",
      subtitulo: "Rendimentos · valores por cota",
      resumo: "Últimos 12 meses: R$ 13,20 por cota · dividend yield de 8,2%",
      eventos: [
        "15/09/2026",
        "14/08/2026",
        "15/07/2026",
        "15/06/2026",
        "15/05/2026",
        "15/04/2026",
        "13/03/2026",
        "13/02/2026",
      ].map((data) => ({ data, evento: "Rendimento", valor: "R$ 1,1000", recebido: "+R$ 46,20" })),
      total: 184,
      nota: "Rendimentos de FII são isentos de IR para pessoa física, dentro das regras. Valores de exemplo.",
    },
  },

  bitcoin: {
    modelo: "comparado",
    slug: "bitcoin",
    nome: "Bitcoin",
    badge: { texto: "₿", cor: "#7A5A12", fonte: 20 },
    tag: "Alternativos · Criptomoeda",
    origem: { tipo: "global", texto: "Global" },
    subtitulo: "BTC · negociado 24 horas por dia",
    criarAlerta: true,
    precoAjustado: false,
    destaque: {
      tipo: "preco",
      rotulo: "Preço de 1 BTC",
      valor: "R$ 615.200",
      variacao: ["R$ 171.400 ▲ (38,62%)", "272,9% do CDI (+24,47 p.p.)"],
    },
    taxas: {
      custo: "—",
      legenda: "depende da corretora onde você guarda o bitcoin",
      itens: [
        { rotulo: "Taxa de negociação", valor: "Depende da corretora" },
        { rotulo: "Taxa de saque", valor: "Depende da corretora e da rede" },
        {
          rotulo: "Imposto de renda",
          valor: "15% sobre o lucro quando as vendas do mês passam de R$ 35 mil",
        },
        { rotulo: "Garantia", valor: "Não tem cobertura do FGC" },
      ],
    },
    detalhes: {
      linhas: [
        { rotulo: "Nome", valor: "Bitcoin" },
        { rotulo: "Classe", valor: "Alternativos", dica: classeHint },
        { rotulo: "Instrumento", valor: "Criptomoeda", dica: instrumentoHint },
        { rotulo: "Emissor", valor: "Não tem (rede descentralizada)" },
        { rotulo: "Negociação", valor: "24 horas, 7 dias por semana" },
      ],
      risco: "Alto",
      nota: "Preço muito volátil · sem garantia do FGC",
    },
    posicao: {
      linhas: [
        { rotulo: "Quantidade", valor: "0,0078 BTC" },
        { rotulo: "Preço médio", valor: "—", vazio: true },
        { rotulo: "Valor hoje", valor: "R$ 4.798,56" },
        { rotulo: "% da carteira", valor: "9,9%" },
        { rotulo: "Origem", valor: "Cadastro manual" },
        { rotulo: "Atualização", valor: "15/09" },
      ],
      nota: noAveragePrice,
    },
    perguntas: [
      "Qual papel o Bitcoin tem na minha carteira?",
      "Quanto de bitcoin faz sentido no meu perfil?",
      "Como declarar bitcoin no imposto de renda?",
    ],
    indicadores: [
      {
        nome: "Rentabilidade",
        valores: ["+4,2%", "+21,5%", "+9,8%", "+18,4%", "+38,6%", "+373,0%", "+156,2%", "—"],
      },
      cdiRow,
      {
        nome: "Excesso (p.p.)",
        valores: ["+3,3%", "+11,1%", "+6,4%", "+11,5%", "+24,4%", "+328,9%", "+76,4%", "—"],
      },
      {
        nome: "Volatilidade anualizada",
        valores: ["41,2%", "44,8%", "46,1%", "47,3%", "48,5%", "51,2%", "58,7%", "—"],
      },
      { nome: "Sharpe", valores: ["—", "—", "—", "—", "0,50", "1,07", "0,14", "—"] },
    ],
    notaIndicadores: "Cotação em reais. O Bitcoin é negociado 24 horas por dia.",
    eventos: {
      tipo: "mensagem",
      subtitulo: "Dividendos, rendimentos e outros pagamentos",
      texto:
        "O Bitcoin não paga dividendos nem rendimentos. O resultado vem só da variação do preço.",
    },
  },
};

/** Chave do ativo nas séries de gráfico. */
export const seriesKey: Record<string, string> = {
  "tesouro-selic-2029": "tesouro",
  "cdb-110-cdi": "cdb",
  bova11: "bova11",
  hglg11: "hglg11",
  bitcoin: "bitcoin",
};
