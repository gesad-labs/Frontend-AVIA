/* ── Envio de arquivos (US025) ────────────────────────────────────────
   O back só aceita a URL do arquivo (POST .../anexos { nome, tipoArquivo, url });
   ele não armazena arquivos. Por isso o front envia o arquivo para um
   armazenamento externo e registra no back a URL devolvida.

   Provedor atual: Cloudinary, upload "unsigned" (não expõe segredo no front).
   Configure em .env (veja .env.example):
       VITE_CLOUDINARY_CLOUD_NAME=...
       VITE_CLOUDINARY_UPLOAD_PRESET=...      (preset do tipo "Unsigned")

   Trocar de provedor (Supabase Storage, Firebase...) = reescrever só enviarArquivo().
   ATENÇÃO: os arquivos ficam acessíveis a quem tiver o link. Quando o back tiver
   um endpoint de upload com autenticação, esta camada deve ser substituída por ele.
   ─────────────────────────────────────────────────────────────────── */

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadConfigurado = Boolean(CLOUD_NAME && UPLOAD_PRESET)

export async function enviarArquivo(file) {
  if (!uploadConfigurado) {
    throw new Error('O envio de arquivos não está configurado neste ambiente.')
  }
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: form })
  } catch {
    throw new Error('Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.')
  }
  const dados = await res.json().catch(() => ({}))
  if (!res.ok || !dados.secure_url) {
    throw new Error(dados?.error?.message || 'O serviço de arquivos recusou o envio.')
  }
  return { url: dados.secure_url, bytes: dados.bytes ?? file.size }
}