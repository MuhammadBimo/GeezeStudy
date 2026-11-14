import { Clock } from 'lucide-react'
import Select from '@/components/ui/Select'

const pad = (n) => String(n).padStart(2, '0')
// Jam dalam langkah 15 menit, dari 05.00 sampai 23.45; bisa dicari dengan mengetik, mis. "19".
const TIMES = Array.from({ length: 76 }, (_, i) => {
  const minutes = 5 * 60 + i * 15
  const v = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
  return { value: v, label: v.replace(':', '.'), icon: Clock }
})

export default function TimePicker({ value, ...props }) {
  // Nilai di luar daftar (mis. 23.59 dari data lama) tetap ditampilkan sebagai pilihan.
  const options = TIMES.some((t) => t.value === value) || !value ? TIMES : [{ value, label: value.replace(':', '.'), icon: Clock }, ...TIMES]
  return <Select searchable placeholder="Pilih jam" options={options} value={value} {...props} />
}
