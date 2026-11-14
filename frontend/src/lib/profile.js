export const educationLevels = [
  { value: 'sd', label: 'SD' },
  { value: 'smp', label: 'SMP' },
  { value: 'sma', label: 'SMA / SMK' },
  { value: 'college', label: 'Mahasiswa' },
]

export const educationLabel = Object.fromEntries(educationLevels.map((l) => [l.value, l.label]))

// Label dan contoh isian institusi menyesuaikan jenjang.
export const institutionField = {
  sd: { label: 'Nama sekolah', placeholder: 'mis. SDN 1 Bandung' },
  smp: { label: 'Nama sekolah', placeholder: 'mis. SMPN 2 Yogyakarta' },
  sma: { label: 'Nama sekolah', placeholder: 'mis. SMAN 3 Semarang atau SMKN 1 Surabaya' },
  college: { label: 'Nama kampus', placeholder: 'mis. Universitas Gadjah Mada' },
}
