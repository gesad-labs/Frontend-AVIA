export function getErrorMessage(err, fallback) {
  if (err?.status == null) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }
  const b = err.body
  return b?.mensagem || b?.menssagem || b?.erro || b?.message || fallback
}