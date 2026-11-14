// Penilaian kekuatan password sederhana: panjang dan variasi huruf, angka, simbol.
export function passwordStrength(value) {
  if (!value) return { score: 0, label: '' }
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const level = Math.min(4, Math.max(1, score - (value.length < 8 ? 1 : 0)))
  return { score: level, label: ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][level] }
}
