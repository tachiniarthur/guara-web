/** Rules for a new password (sign-up, "Esqueci minha senha", "Senha de acesso"). The server has the final word. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/** What is wrong with a new password, in pt-BR; `null` when it is good. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    return "Misture letras e números.";
  }
  return null;
}
