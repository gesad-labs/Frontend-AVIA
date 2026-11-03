/* ── Anexos de cards (US025) ──────────────────────────────────────────
   O back guarda por anexo apenas { id, tarefaId, nome, tipoArquivo, url }:
   NÃO tem autor nem data de upload. Para exibi-los sem mexer no back, o front
   grava esses metadados DENTRO de `tipoArquivo` (texto livre que o back não
   interpreta), neste formato:

       <categoria>;autor=<nome codificado>;em=<ISO-8601>;tam=<bytes>
       ex.: imagem;autor=Ana%20Silva;em=2026-11-03T13:04:05.000Z;tam=48213

   • A 1ª parte continua sendo a categoria simples ('imagem', 'documento',
     'link', 'arquivo'), então telas antigas que comparam `tipoArquivo === 'imagem'`
     seguem funcionando.
   • Anexos antigos (tipoArquivo = 'link') continuam válidos: aparecem sem autor/data.
   • Quando o back passar a devolver autor/data de verdade (autorNome / criadoEm),
     lerAnexo() já dá preferência a eles.
   ATENÇÃO: autor e data são informados pelo cliente — servem para exibição, não
   para auditoria. Auditoria confiável exige gravar no back.
   ─────────────────────────────────────────────────────────────────── */

export const TAMANHO_MAXIMO = 10 * 1024 * 1024 // 10 MB
const LIMITE_TIPO_ARQUIVO = 250                // coluna do back tem 255 caracteres

const EXT_IMAGEM = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp']
const EXT_DOCUMENTO = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'rtf', 'odt', 'ods']
const EXT_OUTROS_PERMITIDOS = ['zip', 'json']
const EXT_PERMITIDAS = [...EXT_IMAGEM, ...EXT_DOCUMENTO, ...EXT_OUTROS_PERMITIDOS]

/* Atributo `accept` do <input type="file"> */
export const ACCEPT_ARQUIVOS = EXT_PERMITIDAS.map(e => `.${e}`).join(',')

export function extensaoDe(nomeOuUrl = '') {
  const limpo = String(nomeOuUrl).split(/[?#]/)[0]
  const i = limpo.lastIndexOf('.')
  return i >= 0 ? limpo.slice(i + 1).toLowerCase() : ''
}

export function categoriaDoArquivo(file) {
  const ext = extensaoDe(file?.name)
  if ((file?.type ?? '').startsWith('image/') || EXT_IMAGEM.includes(ext)) return 'imagem'
  if (EXT_DOCUMENTO.includes(ext)) return 'documento'
  return 'arquivo'
}

export function formatarTamanho(bytes) {
  if (bytes == null || !Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatarDataHora(data) {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return ''
  const d = data.toLocaleDateString('pt-BR')
  const h = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${d} às ${h}`
}

/* Devolve uma mensagem de erro, ou null se o arquivo é aceitável. */
export function validarArquivo(file) {
  if (!file) return 'Selecione um arquivo.'
  if (file.size === 0) return 'O arquivo está vazio.'
  if (file.size > TAMANHO_MAXIMO) {
    return `O arquivo tem ${formatarTamanho(file.size)}; o limite é ${formatarTamanho(TAMANHO_MAXIMO)}.`
  }
  if (!EXT_PERMITIDAS.includes(extensaoDe(file.name))) {
    return 'Tipo de arquivo não permitido. Use imagens, PDF, documentos do Office, texto, CSV, JSON ou ZIP.'
  }
  return null
}

/* Só links http(s) são aceitos/renderizados: bloqueia javascript:, data: etc. */
export function urlSegura(url) {
  try {
    const u = new URL(String(url).trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/* ── Metadados em tipoArquivo ── */
export function montarTipoArquivo({ categoria, autor, emISO, tamanho }) {
  const partes = (autorTexto) => {
    const p = [categoria || 'arquivo']
    if (autorTexto) p.push(`autor=${encodeURIComponent(autorTexto)}`)
    if (emISO) p.push(`em=${emISO}`)
    if (tamanho != null) p.push(`tam=${tamanho}`)
    return p.join(';')
  }
  let nome = (autor ?? '').trim().slice(0, 60)
  let texto = partes(nome)
  // Garante caber na coluna: encurta o nome do autor até servir.
  while (texto.length > LIMITE_TIPO_ARQUIVO && nome.length > 0) {
    nome = nome.slice(0, Math.max(0, nome.length - 5))
    texto = partes(nome)
  }
  return texto
}

function lerMeta(tipoArquivo) {
  const [categoria = '', ...resto] = String(tipoArquivo ?? '').split(';')
  const meta = {}
  for (const par of resto) {
    const i = par.indexOf('=')
    if (i <= 0) continue
    const chave = par.slice(0, i)
    let valor = par.slice(i + 1)
    try { valor = decodeURIComponent(valor) } catch { /* mantém cru */ }
    meta[chave] = valor
  }
  return { categoria: categoria.trim(), meta }
}

/* Normaliza um anexo do back para o que a tela precisa. */
export function lerAnexo(a) {
  const { categoria, meta } = lerMeta(a.tipoArquivo)
  const ext = extensaoDe(a.nome) || extensaoDe(a.url)
  const ehLink = categoria === 'link'
  const ehImagem = categoria === 'imagem' || (EXT_IMAGEM.includes(extensaoDe(a.url)) && ehLink)
  const bruto = a.dataUpload ?? a.criadoEm ?? meta.em ?? null
  const data = bruto ? new Date(bruto) : null
  const tamanho = meta.tam != null && meta.tam !== '' ? Number(meta.tam) : null
  return {
    id: a.id,
    nome: a.nome,
    url: a.url,
    categoria: categoria || 'arquivo',
    ehLink,
    ehImagem,
    ehPdf: ext === 'pdf',
    autor: a.autorNome ?? meta.autor ?? null,
    enviadoEm: data && !Number.isNaN(data.getTime()) ? data : null,
    tamanho: Number.isFinite(tamanho) ? tamanho : null,
    urlValida: urlSegura(a.url),
  }
}

/* Baixa o arquivo. Se o servidor de arquivos não permitir (CORS), abre em nova aba. */
export async function baixarAnexo(anexo) {
  if (!anexo.urlValida) return
  try {
    const res = await fetch(anexo.url, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = anexo.nome || 'arquivo'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  } catch {
    window.open(anexo.url, '_blank', 'noopener,noreferrer')
  }
}