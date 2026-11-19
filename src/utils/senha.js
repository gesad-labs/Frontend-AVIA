/* Regra de senha do back (SenhaForteValidator + CadastroRequestDTO).
   Caracteres especiais ACEITOS são só estes — "qualquer símbolo" NÃO vale
   (ex.: ~ ` espaço é é ñ são recusados pelo back com 400). */
export const ESPECIAIS_ACEITOS = "çÇ!@#$%^&*()_+-=[]{};':\"\\|,.<>/?"
export const SENHA_TAMANHO_MAXIMO = 72  // só o cadastro limita; vale também aqui por consistência

export function temEspecialAceito(senha = '') {
  return [...senha].some(c => ESPECIAIS_ACEITOS.includes(c))
}