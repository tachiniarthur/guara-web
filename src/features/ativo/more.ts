/** Telas que abrem a partir do detalhe do ativo: ficha completa, eventos e gráfico ampliado. */

export type FactSection = { titulo: string; linhas: { label: string; value: string }[] };

/** Ficha completa ("Mais detalhes"). As seções seguem a ordem do celular. */
export const assetFacts: Record<
  string,
  { subtitulo: string; secoes: FactSection[]; nota: string }
> = {
  bova11: {
    subtitulo: "iShares Ibovespa Fundo de Índice · ETF",
    secoes: [
      {
        titulo: "Identificação",
        linhas: [
          { label: "Nome", value: "iShares Ibovespa Fundo de Índice" },
          { label: "Código na B3", value: "BOVA11" },
          { label: "Tipo", value: "ETF de ações" },
          { label: "Índice de referência", value: "Ibovespa" },
          { label: "Gestora", value: "BlackRock" },
          { label: "Administrador", value: "—" },
        ],
      },
      {
        titulo: "Negociação",
        linhas: [
          { label: "Onde negocia", value: "B3, em horário de pregão" },
          { label: "Lote mínimo", value: "1 cota" },
          { label: "Cotação de hoje", value: "R$ 125,10" },
          { label: "Mínima e máxima do ano", value: "R$ 109,80 e R$ 126,40" },
          { label: "Volume médio diário", value: "—" },
        ],
      },
      {
        titulo: "Custos e impostos",
        linhas: [
          { label: "Taxa de administração", value: "0,10% ao ano" },
          { label: "Taxa de performance", value: "Não tem" },
          { label: "Imposto de renda", value: "15% sobre o lucro na venda" },
          { label: "Isenção de R$ 20 mil", value: "Não se aplica a ETF" },
          { label: "Proventos", value: "Reinvestidos no fundo" },
        ],
      },
      {
        titulo: "Risco no Guará",
        linhas: [
          { label: "Risco", value: "Médio · calculado" },
          { label: "Volatilidade anualizada", value: "18,4%" },
          { label: "Liquidez", value: "Alta, resgate em D+2" },
          { label: "Garantia do FGC", value: "Não tem" },
        ],
      },
    ],
    nota: "Dados de exemplo via Brapi, com atraso de até 15 minutos. “—” quando a fonte não informa. Não é recomendação de investimento.",
  },
};

export type EventRow = { data: string; tipo: string; valor: string; recebido?: string };

const rendimento = (data: string, recebido?: string): EventRow => ({
  data,
  tipo: "Rendimento",
  valor: "R$ 1,1000 por cota",
  recebido,
});

/** Todos os eventos corporativos de um ativo, por ano. */
export const assetEvents: Record<
  string,
  {
    total: number;
    desde: string;
    recebido: { valor: string; desde: string };
    doze: { valor: string; legenda: string };
    tipos: string[];
    anos: string[];
    grupos: { ano: string; resumo: string; eventos: EventRow[]; mais?: number }[];
    nota: string;
  }
> = {
  hglg11: {
    total: 184,
    desde: "2010",
    recebido: { valor: "R$ 277,20", desde: "desde abril de 2026" },
    doze: { valor: "R$ 13,20", legenda: "por cota · yield de 8,2%" },
    tipos: ["Todos (184)", "Rendimentos", "Amortizações", "Desdobramentos"],
    anos: ["2026", "2025", "2024", "Anteriores"],
    grupos: [
      {
        ano: "2026",
        resumo: "R$ 9,90 por cota · você recebeu R$ 277,20",
        eventos: [
          rendimento("15/09/2026", "+R$ 46,20"),
          rendimento("14/08/2026", "+R$ 46,20"),
          rendimento("15/07/2026", "+R$ 46,20"),
          rendimento("15/06/2026", "+R$ 46,20"),
          rendimento("15/05/2026", "+R$ 46,20"),
          rendimento("15/04/2026", "+R$ 46,20"),
          rendimento("13/03/2026"),
          rendimento("13/02/2026"),
          rendimento("15/01/2026"),
        ],
      },
      {
        ano: "2025",
        resumo: "R$ 13,20 por cota",
        eventos: [rendimento("15/12/2025"), rendimento("14/11/2025"), rendimento("15/10/2025")],
        mais: 9,
      },
    ],
    nota: "“Você não tinha”: na data com, você ainda não tinha cotas (comprou em abril de 2026). Valores de exemplo via Brapi.",
  },
};

/** Série mensal de 12 meses (out/25 a set/26) no gráfico ampliado. */
export type ChartLine = { nome: string; cor: string; valores: number[]; tracejada?: boolean };

export type ChartTile = { label: string; value: string; hint: string; cor?: string };

export type ChartView = {
  /** Último item do caminho ("Comparar", "Comparar com Ibovespa"). */
  caminho: string;
  comparar: string;
  ajustado: boolean;
  rotulo: string;
  dominio: [number, number];
  marcas: number[];
  linhas: ChartLine[];
  /** Legenda (quando difere do nome da linha, ex.: "HGLG11 sem ajuste"). */
  legenda?: string[];
  tiles: ChartTile[];
  nota?: { destaque?: string; texto: string; tom: "plain" | "arara" };
};

export type ChartDetail = {
  selo: string;
  subtitulo: string;
  linha: string;
  preco: string;
  variacao: string;
  posicao?: { label: string; value: string }[];
  ajuste?: { label: string; value: string }[];
  sobre?: { label: string; value: string }[];
  /** Visões por `?comparar=` (a primeira é a padrão). */
  visoes: Record<string, ChartView>;
};

const bova = [
  111.3, 113, 109.79, 112.6, 115.91, 118.41, 116.2, 119.69, 121.51, 120.1, 123.41, 125.1,
];
const amarelo = "#F2C230";

export const compareOptions = [
  { value: "cdi", nome: "CDI", texto: "Renda fixa pós-fixada · padrão" },
  { value: "ibovespa", nome: "Ibovespa", texto: "Principais ações da B3" },
  { value: "ipca", nome: "IPCA", texto: "Inflação oficial" },
  { value: "sp500", nome: "S&P 500", texto: "500 maiores empresas dos EUA, em reais" },
  { value: "nenhum", nome: "Nenhum", texto: "Mostrar só o ativo" },
];

export const chartDetails: Record<string, ChartDetail> = {
  bova11: {
    selo: "ETF",
    subtitulo: "iShares Ibovespa · ETF",
    linha: "iShares Ibovespa · ETF · B3",
    preco: "R$ 125,10",
    variacao: "▲ R$ 13,80 (12,40%) em 12 meses",
    posicao: [
      { label: "Quantidade", value: "25 cotas" },
      { label: "Valor hoje", value: "R$ 3.127,50" },
      { label: "% da carteira", value: "6,5%" },
      { label: "Preço médio", value: "—" },
    ],
    sobre: [
      { label: "Índice de referência", value: "Ibovespa" },
      { label: "Taxa de administração", value: "0,10% ao ano" },
      { label: "Risco no Guará", value: "Médio" },
    ],
    visoes: {
      cdi: {
        caminho: "Comparar",
        comparar: "CDI",
        ajustado: true,
        rotulo: "BOVA11 comparado com CDI em 12 meses",
        dominio: [105, 130],
        marcas: [105, 115, 125],
        linhas: [
          { nome: "BOVA11", cor: amarelo, valores: bova },
          {
            nome: "CDI",
            cor: "#93A198",
            tracejada: true,
            valores: [
              111.3, 112.55, 113.8, 115.09, 116.37, 117.67, 118.99, 120.33, 121.68, 123.03, 124.42,
              125.8,
            ],
          },
        ],
        tiles: [
          { label: "BOVA11", value: "+12,4%", hint: "12 meses", cor: "text-folha" },
          { label: "CDI", value: "+14,2%", hint: "12 meses", cor: "text-mist" },
          { label: "Diferença", value: "−1,8 p.p.", hint: "87,6% do CDI", cor: "text-urucum" },
        ],
      },
      ibovespa: {
        caminho: "Comparar com Ibovespa",
        comparar: "Ibovespa",
        ajustado: true,
        rotulo: "BOVA11 comparado com Ibovespa em 12 meses",
        dominio: [105, 130],
        marcas: [105, 115, 125],
        linhas: [
          { nome: "BOVA11", cor: amarelo, valores: bova },
          {
            nome: "Ibovespa",
            cor: "#6DB3EC",
            tracejada: true,
            valores: [
              111.3, 113.13, 110.07, 113.01, 116.46, 119.11, 117.04, 120.7, 122.67, 121.4, 124.9,
              126.76,
            ],
          },
        ],
        tiles: [
          { label: "BOVA11", value: "+12,4%", hint: "12 meses", cor: "text-folha" },
          { label: "Ibovespa", value: "+12,5%", hint: "12 meses", cor: "text-arara" },
          { label: "Diferença", value: "−0,1 p.p.", hint: "custo do fundo" },
        ],
        nota: {
          tom: "plain",
          texto: "O BOVA11 replica o Ibovespa. A pequena diferença vem da taxa de 0,10% ao ano.",
        },
      },
    },
  },
  hglg11: {
    selo: "FII",
    subtitulo: "Pátria Log · fundo imobiliário",
    linha: "Pátria Log · FII de galpões · B3",
    preco: "R$ 161,30",
    variacao: "▲ +0,21% hoje",
    ajuste: [
      { label: "Cota em 23/09/2025", value: "R$ 151,90" },
      { label: "Cota hoje", value: "R$ 161,30 · +6,2%" },
      { label: "Rendimentos no período", value: "R$ 13,20 por cota" },
      { label: "Retorno total", value: "+15,0%, igual ao gráfico ajustado" },
    ],
    visoes: {
      "sem-ajuste": {
        caminho: "Preço sem ajuste",
        comparar: "CDI",
        ajustado: false,
        rotulo: "Cota do HGLG11 em 12 meses sem ajuste",
        dominio: [135, 165],
        marcas: [135, 150, 165],
        linhas: [
          {
            nome: "HGLG11",
            cor: amarelo,
            valores: [
              151.89, 152.61, 153.31, 153.39, 154.5, 155.1, 155.79, 156.49, 156.8, 157.81, 159,
              161.3,
            ],
          },
        ],
        legenda: ["HGLG11 sem ajuste"],
        tiles: [
          { label: "Só a cota", value: "+6,2%", hint: "12 meses", cor: "text-folha" },
          { label: "Rendimentos pagos", value: "R$ 13,20", hint: "por cota" },
          {
            label: "Com rendimentos",
            value: "+15,0%",
            hint: "se ligar o ajuste",
            cor: "text-mist",
          },
        ],
        nota: {
          tom: "arara",
          destaque: "Preço ajustado desligado.",
          texto:
            "O gráfico mostra a cota como foi negociada em cada dia. Os rendimentos mensais (R$ 1,10 por cota) não entram, por isso a alta parece menor.",
        },
      },
    },
  },
};
