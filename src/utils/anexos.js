/* ── Anexos de cards (US025) ──────────────────────────────────────────
   Contrato do back (AnexosController):
     POST   .../anexos            multipart/form-data, campo "arquivo"  → AnexoResponseDTO
     GET    .../anexos            → AnexoResponseDTO[]
     GET    .../anexos/{id}/download   (exige token)  → arquivo
     DELETE .../anexos/{id}       (só gerente ou quem enviou)

   AnexoResponseDTO: { id, tarefaId, tipoAnexo, tamanhoBytes, criadoEm,
                       nomeArquivo, nomeUsuario, podeRemover }

   Regras do back: até 25 MB; só PDF, PNG, JPEG e DOCX. O tipo é conferido pelo
   CONTEÚDO do arquivo (não pela extensão), então a checagem do front abaixo é só
   um atalho para avisar antes do envio — quem decide é o back.
   ─────────────────────────────────────────────────────────────────── */
import { getErrorMessage } from './errors'

export const TAMANHO_MAXIMO = 25 * 1024 * 1024 // 25 MB (igual ao ArquivoValidator do back)

const EXT_PERMITIDAS = ['pdf', 'png', 'jpg', 'jpeg', 'docx']

/* Atributo `accept` do <input type="file"> */
export const ACCEPT_ARQUIVOS = EXT_PERMITIDAS.map(e => `.${e}`).join(',')
export const TIPOS_LEGIVEIS = 'PDF, PNG, JPG ou DOCX'

export function extensaoDe(nome = '') {
  const i = String(nome).lastIndexOf('.')
  return i >= 0 ? String(nome).slice(i + 1).toLowerCase() : ''
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

/* Devolve uma mensagem de erro, ou null se o arquivo parece aceitável. */
export function validarArquivo(file) {
  if (!file) return 'Selecione um arquivo.'
  if (file.size === 0) return 'O arquivo está vazio.'
  if (file.size > TAMANHO_MAXIMO) {
    return `O arquivo tem ${formatarTamanho(file.size)}; o limite é ${formatarTamanho(TAMANHO_MAXIMO)}.`
  }
  if (!EXT_PERMITIDAS.includes(extensaoDe(file.name))) {
    return `Tipo de arquivo não permitido. Envie ${TIPOS_LEGIVEIS}.`
  }
  return null
}

/* Normaliza um anexo do back para o que a tela precisa. */
export function lerAnexo(a) {
  const tipo = String(a.tipoAnexo ?? '').toUpperCase()
  const data = a.criadoEm ? new Date(a.criadoEm) : null
  return {
    id: a.id,
    nome: a.nomeArquivo ?? 'arquivo',
    tipo,
    ehImagem: tipo === 'PNG' || tipo === 'JPEG',
    ehPdf: tipo === 'PDF',
    tamanho: Number.isFinite(a.tamanhoBytes) ? a.tamanhoBytes : null,
    autor: a.nomeUsuario ?? null,
    enviadoEm: data && !Number.isNaN(data.getTime()) ? data : null,
    podeRemover: Boolean(a.podeRemover),   // o back diz se o botão "remover" deve aparecer
  }
}

/* "Enviado por Ana · 03/11/2026 às 10:04 · 48 KB" */
export function metaDoAnexo(a) {
  const quem = a.autor ? `Enviado por ${a.autor}` : ''
  const quando = a.enviadoEm ? formatarDataHora(a.enviadoEm) : ''
  const base = [quem, quando].filter(Boolean).join(' · ') || 'Autor e data não informados'
  return a.tamanho != null ? `${base} · ${formatarTamanho(a.tamanho)}` : base
}

/* Mensagem de erro de upload/download/remoção: a mesma regra de todo o sistema
   (mensagem do back se for segura; senão a genérica). 413 e 415 já chegam com texto do back. */
export function mensagemErroAnexo(err) {
  return getErrorMessage(err)
}

/* ── Arquivos baixados do back (Blob) ── */
export function salvarBlob(blob, nome) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = nome || 'arquivo'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

/* Abre o arquivo numa nova aba. A aba é aberta JÁ, no clique (senão o navegador bloqueia
   o pop-up por causa do download assíncrono); depois recebe o conteúdo. */
export async function abrirBlobEmNovaAba(obterBlob, nome) {
  const janela = window.open('', '_blank')
  try {
    const blob = await obterBlob()
    if (!janela) { salvarBlob(blob, nome); return }   // pop-up bloqueado: baixa em vez de abrir
    const url = URL.createObjectURL(blob)
    janela.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
  } catch (erro) {
    janela?.close()
    throw erro
  }
}