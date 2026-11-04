/** Bens fora da carteira de investimentos: imóveis e veículos, sempre pelo valor que a pessoa informa. */

export const patrimonioHoje = {
  semImovel: "R$ 126.810,90",
  semVeiculo: "R$ 668.310,90",
  comBem: "R$ 746.810,90",
};

export const propertyDraft = {
  nome: "Apartamento em Pinheiros",
  tipos: ["Apartamento", "Casa", "Terreno", "Comercial", "Outro"],
  area: "72 m²",
  cidade: "São Paulo, SP",
  valor: "R$ 620.000,00",
  data: "Agosto de 2026",
  saldo: "R$ 214.300,00",
  previa: [
    { label: "Este bem soma", value: "+R$ 620.000" },
    { label: "Valor líquido, sem a dívida", value: "R$ 405.700" },
    { label: "Alocação do perfil Moderado", value: "não muda · só investimentos" },
  ],
};

export const vehicleDraft = {
  nome: "Onix LT 2022",
  tipos: ["Carro", "Moto", "Caminhão"],
  marca: "Chevrolet",
  modelo: "Onix LT 1.0 Turbo",
  ano: "2022",
  combustiveis: ["Gasolina", "Flex", "Etanol", "Diesel", "Elétrico", "Híbrido"],
  combustivel: "Gasolina",
  valor: "R$ 78.500,00",
  data: "Setembro de 2026",
  previa: [
    { label: "Este bem soma", value: "+R$ 78.500" },
    { label: "Saldo devedor", value: "— · quitado" },
    { label: "Alocação do perfil Moderado", value: "não muda · só investimentos" },
  ],
};

export const propertyDetail = {
  id: "apto",
  tipo: "imovel" as const,
  nome: "Apartamento em Pinheiros",
  linha: "Imóvel · 72 m² · São Paulo",
  rotuloValor: "Valor estimado por você",
  valor: "R$ 620.000",
  atualizacao: "Atualizado em agosto de 2026 · próxima revisão em fevereiro de 2027",
  financiamento: {
    saldo: { valor: "R$ 214.300", nota: "informado em ago/2026" },
    liquido: { valor: "R$ 405.700", nota: "valor menos a dívida" },
    quitado: 65,
    aviso:
      "O saldo devedor não atualiza sozinho. Quando chegar o extrato do financiamento, toque em “Atualizar saldo”.",
  },
  historico: [
    { mes: "Agosto de 2026", origem: "Estimativa sua", valor: "R$ 620.000", variacao: "+3,3%" },
    { mes: "Fevereiro de 2026", origem: "Estimativa sua", valor: "R$ 600.000", variacao: "+2,6%" },
    { mes: "Setembro de 2025", origem: "Cadastro do imóvel", valor: "R$ 585.000" },
  ],
  patrimonio: [
    { label: "Patrimônio total", value: "R$ 746.810,90" },
    { label: "Este imóvel", value: "83% do total" },
    { label: "Alocação do perfil", value: "não entra" },
  ],
};

export const vehicleDetail = {
  id: "onix",
  tipo: "veiculo" as const,
  nome: "Onix LT 2022",
  linha: "Veículo · quitado",
  rotuloValor: "Valor estimado por você",
  valor: "R$ 78.500",
  atualizacao: "Informado em setembro de 2026 · próxima revisão em março de 2027",
  historico: [{ mes: "Setembro de 2026", origem: "Cadastro do veículo", valor: "R$ 78.500" }],
  dados: [
    { label: "Marca e modelo", value: "Chevrolet Onix LT 1.0 Turbo" },
    { label: "Ano e combustível", value: "2022 · Gasolina" },
    { label: "Situação", value: "Quitado" },
    { label: "Placa", value: "—" },
    { label: "Atualização", value: "Você informa · lembramos a cada 6 meses" },
  ],
  patrimonio: [
    { label: "Patrimônio total", value: "R$ 746.810,90" },
    { label: "Este veículo", value: "10,5% do total" },
    { label: "Alocação do perfil", value: "não entra" },
  ],
};
