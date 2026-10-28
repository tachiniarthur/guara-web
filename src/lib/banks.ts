/**
 * Marca de cada banco (cor e sigla), a mesma em todo lugar em que um banco aparece: escolha e
 * conexão, Meu perfil, filtros, lançamentos e investimentos. Iguais às do app
 * (`apps/mobile/src/constants/banks.ts`). Quando houver os arquivos oficiais dos logos, entram
 * em `logo` e substituem a sigla.
 */
export type BankBrand = {
  id: string;
  name: string;
  /** Sigla no quadrado ("nu", "itaú", "BB"). */
  mark: string;
  /** Fundo (cor principal do banco) e cor da sigla. */
  background: string;
  color: string;
  logo?: string;
};

export const bankBrands: Record<string, BankBrand> = {
  nubank: { id: "nubank", name: "Nubank", mark: "nu", background: "#820AD1", color: "#FFFFFF" },
  itau: { id: "itau", name: "Itaú", mark: "itaú", background: "#EC7000", color: "#002E6E" },
  bradesco: {
    id: "bradesco",
    name: "Bradesco",
    mark: "B",
    background: "#CC092F",
    color: "#FFFFFF",
  },
  bb: { id: "bb", name: "Banco do Brasil", mark: "BB", background: "#FCFC30", color: "#003DA5" },
  caixa: { id: "caixa", name: "Caixa", mark: "X", background: "#005CA9", color: "#F7A600" },
  inter: { id: "inter", name: "Inter", mark: "inter", background: "#FF7A00", color: "#FFFFFF" },
  santander: {
    id: "santander",
    name: "Santander",
    mark: "S",
    background: "#EC0000",
    color: "#FFFFFF",
  },
  c6: { id: "c6", name: "C6 Bank", mark: "C6", background: "#242424", color: "#FFFFFF" },
};

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/**
 * A marca pelo id ("itau") ou pelo nome, mesmo com o tipo de conta junto ("Itaú débito",
 * "Nubank crédito"). Banco sem marca cadastrada: a inicial em cinza.
 */
export function bankBrand(idOrName: string): BankBrand {
  const key = normalize(idOrName);
  const found =
    bankBrands[key] ??
    Object.values(bankBrands).find(
      (brand) => key === normalize(brand.name) || key.startsWith(`${normalize(brand.name)} `),
    );
  return (
    found ?? {
      id: key,
      name: idOrName,
      mark: idOrName.trim().charAt(0).toUpperCase(),
      background: "#2A3530",
      color: "#F2EFE6",
    }
  );
}
