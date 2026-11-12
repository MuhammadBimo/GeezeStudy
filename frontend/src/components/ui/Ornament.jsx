// Dekorasi garis kontur + daun. Murni visual, disembunyikan dari pembaca layar.
export default function Ornament({ className }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <circle cx="200" cy="200" r="190" />
      <circle cx="200" cy="200" r="150" />
      <circle cx="200" cy="200" r="110" />
      <circle cx="200" cy="200" r="70" />
      <path d="M200 10v380M10 200h380" strokeOpacity=".5" />
      <path d="M200 200C200 120 260 70 330 70c0 80-60 130-130 130Z" fill="currentColor" fillOpacity=".25" />
    </svg>
  )
}
