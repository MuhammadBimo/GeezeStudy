export const statusMeta = {
  todo: { label: 'Belum mulai', tone: 'neutral' },
  progress: { label: 'Dikerjakan', tone: 'info' },
  done: { label: 'Selesai', tone: 'success' },
}

export const priorityMeta = {
  Tinggi: { tone: 'danger', dot: 'bg-danger' },
  Sedang: { tone: 'sand', dot: 'bg-[#c9a96a]' },
  Rendah: { tone: 'neutral', dot: 'bg-sage-deep' },
}

export const priorityOptions = [
  { value: 'Tinggi', label: 'Tinggi', description: 'Kerjakan lebih dulu' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Rendah', label: 'Rendah', description: 'Bisa menunggu' },
]

export const statusOptions = [
  { value: 'todo', label: 'Belum mulai' },
  { value: 'progress', label: 'Dikerjakan' },
  { value: 'done', label: 'Selesai' },
]
