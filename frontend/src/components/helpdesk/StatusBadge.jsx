import Badge from '@/components/ui/Badge'
import { statusMeta } from '@/lib/helpdesk'

export default function StatusBadge({ status }) {
  const meta = statusMeta[status] ?? statusMeta.pending
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
}
