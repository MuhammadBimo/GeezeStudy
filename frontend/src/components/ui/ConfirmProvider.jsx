import { useCallback, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ConfirmContext } from '@/context/confirm-context'

// Pengganti window.confirm: dialog bergaya aplikasi yang mengembalikan Promise<boolean>.
export default function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const confirm = useCallback(
    (options) => new Promise((resolve) => setState({ confirmLabel: 'Lanjutkan', cancelLabel: 'Batal', tone: 'default', ...options, resolve })),
    [],
  )

  const finish = (result) => {
    state?.resolve(result)
    setState((s) => (s ? { ...s, open: false, resolve: () => {} } : s))
  }

  const open = Boolean(state && state.open !== false)

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Modal
        open={open}
        onClose={() => finish(false)}
        size="sm"
        title={state?.title ?? ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => finish(false)}>{state?.cancelLabel}</Button>
            <Button variant={state?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => finish(true)} autoFocus>
              {state?.confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          {state?.tone === 'danger' && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
          )}
          <p className="pt-1 text-[0.9375rem] text-ink-2">{state?.description}</p>
        </div>
      </Modal>
    </ConfirmContext>
  )
}
