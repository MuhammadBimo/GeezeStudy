export const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.zip,.rar'
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

export const formatSize = (bytes) => {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

/** Jenis berkas dari ekstensinya: image | sheet | slides | archive | doc */
export function fileKind(name = '') {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['ppt', 'pptx'].includes(ext)) return 'slides'
  if (['zip', 'rar'].includes(ext)) return 'archive'
  return 'doc'
}
