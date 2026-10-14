import type { Risk } from "./data";

export type HoldingOrigin = "Open Finance" | "Cadastro manual" | "Cadastro via chat";

export type Holding = {
  id: string;
  /** Página do ativo (quando existe detalhe). */
  slug?: string;
  nome: string;
  descricao: string;
  risco: Risk;
  origem: string;
  tipoOrigem: HoldingOrigin;
  total: string;
  percentual: string;
  hoje: { valor: string; alta: boolean };
  /** Motivo do risco calculado (diálogo "Ajustar risco"). */
  porque?: { label: string; value: string }[];
};

export type HoldingClass = {
  classe: string;
  cor: string;
  total: string;
  percentual: string;
  itens: Holding[];
};

const h = (
  id: string,
  nome: string,
  descricao: string,
  risco: Risk,
  origem: string,
  total: string,
  percentual: string,
  hoje: string,
  slug?: string,
): Holding => ({
  id,
  slug,
  nome,
  descricao,
  risco,
  origem,
  tipoOrigem: origem.includes("Open Finance")
    ? "Open Finance"
    : origem.includes("chat")
      ? "Cadastro via chat"
      : "Cadastro manual",
  total,
  percentual,
  hoje: { valor: hoje, alta: !hoje.startsWith("−") },
});

export const holdingClasses: HoldingClass[] = [
  {
    classe: "Renda fixa",
    cor: "#6DB3EC",
    total: "R$ 22.222,10",
    percentual: "46,0%",
    itens: [
      h(
        "tesouro-selic",
        "Tesouro Selic 2029",
        "Tesouro Direto · vence em 2029",
        "Baixo",
        "Itaú · Open Finance",
        "R$ 15.892,10",
        "32,9%",
        "+0,04%",
        "tesouro-selic-2029",
      ),
      h(
        "cdb",
        "CDB 110% CDI",
        "Nubank · garantido pelo FGC",
        "Baixo",
        "Nubank · Open Finance",
        "R$ 6.330,00",
        "13,1%",
        "+0,04%",
        "cdb-110-cdi",
      ),
    ],
  },
  {
    classe: "Renda variável",
    cor: "#FF6A50",
    total: "R$ 10.691,50",
    percentual: "22,1%",
    itens: [
      h(
        "petr4",
        "PETR4",
        "Petrobras PN · 200 ações",
        "Alto",
        "Cadastro manual",
        "R$ 7.564,00",
        "15,7%",
        "−1,12%",
        "petr4",
      ),
      h(
        "bova11",
        "BOVA11",
        "iShares Ibovespa · 25 cotas",
        "Médio",
        "Cadastro manual",
        "R$ 3.127,50",
        "6,5%",
        "+0,38%",
        "bova11",
      ),
    ],
  },
  {
    classe: "Imobiliário",
    cor: "#F2C230",
    total: "R$ 6.774,60",
    percentual: "14,0%",
    itens: [
      h(
        "hglg11",
        "HGLG11",
        "Pátria Log · 42 cotas",
        "Médio",
        "Cadastro via chat",
        "R$ 6.774,60",
        "14,0%",
        "+0,21%",
        "hglg11",
      ),
    ],
  },
  {
    classe: "Alternativos",
    cor: "#6CC08E",
    total: "R$ 4.798,56",
    percentual: "9,9%",
    itens: [
      h(
        "bitcoin",
        "Bitcoin",
        "BTC · 0,0078",
        "Alto",
        "Cadastro manual",
        "R$ 4.798,56",
        "9,9%",
        "+2,40%",
        "bitcoin",
      ),
    ],
  },
  {
    classe: "Internacional",
    cor: "#93A198",
    total: "R$ 3.824,14",
    percentual: "7,9%",
    itens: [
      h(
        "ivvb11",
        "IVVB11",
        "iShares S&P 500 · 4 cotas",
        "Médio",
        "Cadastro manual",
        "R$ 1.405,60",
        "2,9%",
        "+0,52%",
      ),
      h(
        "aapl34",
        "AAPL34",
        "Apple · BDR · 9 cotas",
        "Alto",
        "Cadastro manual",
        "R$ 712,80",
        "1,5%",
        "+0,88%",
      ),
      h(
        "msft34",
        "MSFT34",
        "Microsoft · BDR · 6 cotas",
        "Alto",
        "Cadastro manual",
        "R$ 598,20",
        "1,2%",
        "+0,31%",
      ),
      h(
        "nvdc34",
        "NVDC34",
        "NVIDIA · BDR · 15 cotas",
        "Alto",
        "Cadastro manual",
        "R$ 486,90",
        "1,0%",
        "−0,74%",
      ),
      h(
        "amzo34",
        "AMZO34",
        "Amazon · BDR · 6 cotas",
        "Alto",
        "Cadastro manual",
        "R$ 352,44",
        "0,7%",
        "+0,19%",
      ),
      h(
        "gogl34",
        "GOGL34",
        "Alphabet · BDR · 4 cotas",
        "Alto",
        "Cadastro manual",
        "R$ 268,20",
        "0,6%",
        "+0,42%",
      ),
    ],
  },
];

export const allHoldings = holdingClasses.flatMap((c) => c.itens);

export const holdingsSummary = {
  total: "R$ 48.310,90",
  quantidade: 12,
  hora: "14:30",
  porOrigem: [
    { label: "Open Finance", value: "2 posições · R$ 22.222,10" },
    { label: "Cadastro manual", value: "9 posições · R$ 19.314,20" },
    { label: "Cadastro via chat", value: "1 posição · R$ 6.774,60" },
  ],
};

/** O que pesa no risco calculado de cada ativo. */
export const riskReasons: Record<string, { label: string; value: string }[]> = {
  petr4: [
    { label: "Volatilidade em 12 meses", value: "26,3% ao ano" },
    { label: "Setor", value: "Petróleo, sensível a preço e política" },
    { label: "Liquidez", value: "Alta" },
  ],
};

export const riskOptions: { risco: Risk; texto: string }[] = [
  { risco: "Baixo", texto: "Oscila pouco e tem garantia ou baixo risco de crédito" },
  { risco: "Médio", texto: "Oscila de vez em quando" },
  { risco: "Alto", texto: "Oscila bastante" },
];

/** O mesmo título vindo do Open Finance e do cadastro manual (tela "Investimento duplicado"). */
export const duplicateHolding = {
  nome: "Tesouro Selic 2029",
  banco: "Itaú",
  openFinance: [
    { label: "Valor hoje", value: "R$ 15.892,10" },
    { label: "Quantidade", value: "—" },
    { label: "Atualizado", value: "Hoje, 14:30 · sozinho" },
  ],
  manual: [
    { label: "Valor informado", value: "R$ 15.600,00" },
    { label: "Quantidade", value: "—" },
    { label: "Cadastrado", value: "10/03/2026 · à mão" },
  ],
  opcoes: [
    {
      titulo: "Excluir o cadastro manual",
      texto: "Fica só o do Itaú, que atualiza sozinho. Use quando é o mesmo título.",
    },
    {
      titulo: "Manter separados",
      texto: "Os dois aparecem na carteira. Use quando são compras diferentes.",
    },
    {
      titulo: "Somar os dois",
      texto:
        "Vira uma posição só, com R$ 31.492,10. Use quando o manual é outra compra do mesmo título.",
    },
  ],
};
