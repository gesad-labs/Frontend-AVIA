/* ── Padronização de erros do front (TK001) ───────────────────────────
   Regra única para QUALQUER erro que chega à tela:

     1. O back respondeu uma mensagem válida e segura → mostra a do back.
     2. A mensagem tem dado sensível / detalhe interno (stack trace, SQL,
        caminho de arquivo, token, nome de classe...) → "Ocorreu um erro inesperado."
     3. O back não mandou mensagem utilizável (corpo vazio, HTML de proxy,
        "Internal Server Error"...) → mensagem padrão do status, ou a genérica.

   Formato do back (ErroResponseDTO): { mensagem, erros? }
     erros = { campo: ["mensagem do campo", ...] }   (validação, HTTP 400)

   `err` é o objeto lançado por services/api.js: { status, body }.
   Falha de rede lança TypeError, sem status. Qualquer OUTRO erro de JavaScript
   (um bug) nunca tem o texto exibido: vira a mensagem genérica.

   Falso positivo é o lado seguro: na dúvida, a mensagem do back é trocada pela
   genérica. Falso negativo é o lado perigoso — por isso a lista abaixo é ampla.
   ─────────────────────────────────────────────────────────────────── */

export const MENSAGEM_GENERICA    = 'Ocorreu um erro inesperado.'
export const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'

/* Textos padrão por status, usados só quando o back NÃO mandou mensagem utilizável
   (os mesmos que o próprio back usa em GlobalExceptionHandler.mensagemPadrao). */
const MENSAGEM_POR_STATUS = {
  400: 'Requisição inválida.',
  401: 'Sessão expirada ou inválida. Faça login novamente.',
  403: 'Você não tem permissão para executar essa ação.',
  404: 'Recurso não encontrado.',
  409: 'A operação entra em conflito com o estado atual dos dados.',
  413: 'O arquivo excede o tamanho máximo de 25 MB.',
}

const TAMANHO_MAXIMO = 300

/* ── O que NÃO pode aparecer na tela ── */
const PADROES_SENSIVEIS = [
  // exceções e stack traces
  /\b[\w$.]*(Exception|Throwable)\b/,
  /\b[A-Z][A-Za-z]*Error\b/,
  /\bError:/,
  /\bat\s+[\w$.<>]+\([^)]*\)/,
  /\.(java|kt|jsx?|tsx?|py|php|rb|cs):\d+/i,
  /\b(stack\s*trace|traceback|caused by|whitelabel)\b/i,
  /\b(NullPointer|ClassCast|IndexOutOfBounds|StackOverflow|OutOfMemory)\w*/i,
  /\b(java|javax|jakarta|jdk|sun)\.[a-z]+\.\w+/,
  /\borg\.(springframework|hibernate|apache|postgresql|jboss|slf4j|h2)\b/i,
  /\bbr\.com\.\w+/i,
  /\bcom\.(zaxxer|fasterxml|mysql|oracle|microsoft)\b/i,
  // banco de dados / SQL
  /\b(select|insert|update|delete)\b[\s\S]*\b(from|into|set|where)\b/i,
  /\b(sqlexception|sqlstate|psql|jdbc|hibernate|postgres(ql)?|mysql|mariadb|oracle|mongodb|sqlite)\b/i,
  /\b(constraint|duplicate key|violates|foreign key|unique index|deadlock|could not execute|ora-\d+)\b/i,
  /\b(relation|column|table)\s+["'`]/i,
  // infraestrutura: hosts, portas, caminhos, URLs
  /\b(localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i,
  /\b\d{1,3}(\.\d{1,3}){3}\b/,
  /\w:\d{4,5}\b/,
  /https?:\/\/\S+/i,
  /(^|[\s"'(=])\/(home|var|usr|etc|opt|tmp|app|srv|root|proc|bin|lib|src|node_modules)\//i,
  /\b[A-Za-z]:\\[^\s]+/,
  /\\\\[\w.$-]+\\/,
  /\bnode_modules\b/i,
  /\b(econn\w+|enotfound|etimedout|eai_again|epipe)\b/i,
  // segredos e credenciais
  /\bBearer\s+[\w.~+/=-]+/i,
  /\beyJ[\w-]{10,}/,
  /\b(password|passwd|senha|secret|token|api[_-]?key|authorization|credential)\w*\s*[=:]\s*\S+/i,
  /\b[a-f0-9]{32,}\b/i,
  /\b[A-Za-z0-9+/_-]{40,}={0,2}(?![A-Za-z0-9])/,
  // lixo técnico de JavaScript / respostas que não são texto
  /<\/?[a-z][^>]*>/i,
  /<!doctype/i,
  /\bundefined\b|\[object\s+\w+\]|\bNaN\b|\bnull\b/,
  /unexpected token|json\.parse|is not a function|cannot read propert|is not defined|failed to fetch/i,
  // identificadores internos em CAIXA ALTA (ex.: nome de constante de enum de permissão)
  /\b[A-Z]{10,}\b/,
]

/* ── O que não ajuda ninguém: textos técnicos em inglês ou sem conteúdo ── */
const PADROES_SEM_UTILIDADE = [
  /^(internal server error|bad request|not found|forbidden|unauthorized|service unavailable|bad gateway|gateway timeout|method not allowed|conflict|unsupported media type|payload too large|too many requests|error|erro|ok|none|n\/a)\.?$/i,
  /\b(request failed|status code)\b/i,
]

/* 'segura' | 'sensivel' | 'invalida' */
export function classificarMensagem(texto) {
  if (typeof texto !== 'string') return 'invalida'
  const t = texto.trim()
  if (t === '' || /^[\W\d_]*$/.test(t)) return 'invalida'
  if (PADROES_SEM_UTILIDADE.some(p => p.test(t))) return 'invalida'
  if (t.length > TAMANHO_MAXIMO || t.split('\n').length > 2) return 'sensivel'
  if (PADROES_SENSIVEIS.some(p => p.test(t))) return 'sensivel'
  return 'segura'
}

export function ehMensagemSegura(texto) {
  return classificarMensagem(texto) === 'segura'
}

/* TypeError do fetch = não houve resposta do servidor (offline, DNS, CORS, servidor fora do ar). */
export function ehErroDeConexao(err) {
  if (!err || err.status != null) return false
  return err instanceof TypeError || /failed to fetch|networkerror|load failed|network request failed/i.test(String(err.message ?? ''))
}

function mensagensDeCampos(body) {
  if (!body || typeof body !== 'object' || !body.erros || typeof body.erros !== 'object') return []
  return Object.values(body.erros).flat().filter(m => typeof m === 'string')
}

function mensagemPrincipal(body) {
  if (typeof body === 'string') return body
  if (!body || typeof body !== 'object') return null
  return body.mensagem ?? body.menssagem ?? body.message ?? null   // menssagem = typo do back antigo
}

/* Lê o erro e diz o que ele é, sem decidir o texto.
   tipo: 'conexao' | 'js' | 'segura' | 'sensivel' | 'invalida' */
function analisar(err) {
  if (ehErroDeConexao(err)) return { tipo: 'conexao' }
  if (err?.status == null) return { tipo: 'js' }                  // erro de JavaScript: nunca mostra o texto

  // Erros de validação: as mensagens dos campos dizem mais que "Dados inválidos"
  const campos = [...new Set(mensagensDeCampos(err.body).filter(ehMensagemSegura).map(m => m.trim()))]
  if (campos.length > 0) return { tipo: 'segura', mensagem: campos.slice(0, 3).join(' ') }

  const mensagem = mensagemPrincipal(err.body)
  const tipo = classificarMensagem(mensagem)
  return tipo === 'segura' ? { tipo, mensagem: mensagem.trim() } : { tipo }
}

/* A mensagem do back, SE ela for válida e segura; senão null. Útil quando a tela quer um
   texto próprio para o caso "o back não disse nada" (ex.: 401 no login = credencial inválida). */
export function mensagemSeguraDoBack(err) {
  const a = analisar(err)
  return a.tipo === 'segura' ? a.mensagem : null
}

/* A ÚNICA função que as telas devem usar para obter o texto de um erro.
   O 2º parâmetro existe só por compatibilidade com chamadas antigas e é ignorado:
   a mensagem padrão é sempre a mesma em todo o sistema. */
// eslint-disable-next-line no-unused-vars
export function getErrorMessage(err, _legado) {
  const a = analisar(err)
  switch (a.tipo) {
    case 'conexao':  return MENSAGEM_SEM_CONEXAO
    case 'segura':   return a.mensagem
    case 'invalida': return MENSAGEM_POR_STATUS[err.status] ?? MENSAGEM_GENERICA
    default:         return MENSAGEM_GENERICA                       // 'sensivel' e 'js'
  }
}