import { LazyMotion, domAnimation, m } from 'motion/react'

// Momen masuk tunggal untuk hero Dashboard. Menghormati prefers-reduced-motion lewat <MotionConfig reducedMotion="user"> di App.
export default function Reveal({ delay = 0, className = '', children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
