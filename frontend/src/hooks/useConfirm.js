import { use } from 'react'
import { ConfirmContext } from '@/context/confirm-context'

/** const ok = await confirm({ title, description, confirmLabel, tone: 'danger' }) */
export const useConfirm = () => use(ConfirmContext)
