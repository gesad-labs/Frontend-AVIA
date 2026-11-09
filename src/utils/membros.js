// O backend serializa `papel` em minúsculo ("gerente"); normalizamos.
// `cargo === 'Gerente'` é mantido como fallback (criador do projeto).
export function isGerente(membro) {
  return membro?.papel?.toUpperCase() === 'GERENTE' || membro?.cargo === 'Gerente'
}

export function temCargoGerente(membro) {
  return membro?.cargo === 'Gerente'
}