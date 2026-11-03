/** Rules for a new password (sign-up, "Esqueci minha senha", "Senha de acesso"). The server has the final word. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/** Uppercase letters, accented ones included (no `\p{Lu}`: not every engine has it). */
const UPPERCASE = /[A-ZÀ-ÖØ-Þ]/;
/** Anything that is not a letter, a digit or a space: ! @ # $ % & * . - _ … */
const SPECIAL = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s]/;

/** One rule of the checklist under the new-password field, met or not yet. */
export type PasswordCheck = {
  id: "length" | "upper" | "digit" | "special";
  label: string;
  ok: boolean;
};

/** The rules of a new password, in the order the checklist shows them (updated while typing). */
export function passwordChecks(password: string): PasswordCheck[] {
  return [
    {
      id: "length",
      label: `${PASSWORD_MIN_LENGTH} caracteres ou mais`,
      ok: password.length >= PASSWORD_MIN_LENGTH,
    },
    { id: "upper", label: "Uma letra maiúscula", ok: UPPERCASE.test(password) },
    { id: "digit", label: "Um número", ok: /\d/.test(password) },
    { id: "special", label: "Um caractere especial (! @ # $…)", ok: SPECIAL.test(password) },
  ];
}

/** What is wrong with a new password, in pt-BR; `null` when it is good. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (!UPPERCASE.test(password)) return "Inclua pelo menos uma letra maiúscula.";
  if (!/\d/.test(password)) return "Inclua pelo menos um número.";
  if (!SPECIAL.test(password)) return "Inclua pelo menos um caractere especial (como ! @ # $).";
  return null;
}
