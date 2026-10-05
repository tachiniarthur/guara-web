export type AgentId = "capivara" | "tamandua" | "pacu" | "caramelo" | "quero-quero" | "onca";

export type Agent = {
  id: AgentId;
  nome: string;
  cientifico: string;
  /** Área do dinheiro de que o bicho cuida. */
  area: string;
  /** Descrição curta usada no menu (ex.: "Coordena a equipe"). */
  papel: string;
  bioma: string;
  /** Cor do anel do retrato (cor do bioma). */
  anel: string;
  retrato: string;
  cena: string;
};

/** A turma: cada bicho cuida de uma parte do dinheiro. */
export const agents: Record<AgentId, Agent> = {
  capivara: {
    id: "capivara",
    nome: "Capivara",
    cientifico: "Hydrochoerus hydrochaeris",
    area: "Coordenação",
    papel: "Coordena a equipe",
    bioma: "Pantanal",
    anel: "#5C4A2E",
    retrato: "/images/assistentes/capivara.jpg",
    cena: "/images/cenas/capivara.jpg",
  },
  tamandua: {
    id: "tamandua",
    nome: "Tamanduá",
    cientifico: "Myrmecophaga tridactyla",
    area: "Gastos",
    papel: "Gastos",
    bioma: "Cerrado",
    anel: "#6A4428",
    retrato: "/images/assistentes/tamandua.jpg",
    cena: "/images/cenas/tamandua.jpg",
  },
  pacu: {
    id: "pacu",
    nome: "Pacu",
    cientifico: "Piaractus mesopotamicus",
    area: "Investimentos",
    papel: "Investimentos",
    bioma: "Pantanal",
    anel: "#23513C",
    retrato: "/images/assistentes/pacu.jpg",
    cena: "/images/cenas/pacu.jpg",
  },
  caramelo: {
    id: "caramelo",
    nome: "Caramelo",
    cientifico: "Canis lupus familiaris",
    area: "Alertas de preço",
    papel: "Alertas de preço",
    bioma: "Cidade",
    anel: "#1F4A4E",
    retrato: "/images/assistentes/caramelo.jpg",
    cena: "/images/cenas/caramelo.jpg",
  },
  "quero-quero": {
    id: "quero-quero",
    nome: "Quero-quero",
    cientifico: "Vanellus chilensis",
    area: "Fora do padrão",
    papel: "Fora do padrão",
    bioma: "Pampa",
    anel: "#44502A",
    retrato: "/images/assistentes/quero-quero.jpg",
    cena: "/images/cenas/quero-quero.jpg",
  },
  onca: {
    id: "onca",
    nome: "Onça",
    cientifico: "Panthera onca",
    area: "Metas",
    papel: "Metas e objetivos",
    bioma: "Amazônia",
    anel: "#7A3B1E",
    retrato: "/images/assistentes/onca.jpg",
    cena: "/images/cenas/onca.jpg",
  },
};

/** Ordem em que a turma aparece nos menus. */
export const agentOrder: AgentId[] = [
  "capivara",
  "tamandua",
  "pacu",
  "caramelo",
  "quero-quero",
  "onca",
];
