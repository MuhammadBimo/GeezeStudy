// Menurunkan nama tampilan dari isian bebas, mis. "bimo.krisyono@gmail.com" -> "Bimo Krisyono".
export function nameFromEmail(value) {
  const local = value.trim().split('@')[0]
  const words = local.split(/[._\-\s]+/).filter(Boolean)
  if (words.length === 0) return 'Teman'
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
