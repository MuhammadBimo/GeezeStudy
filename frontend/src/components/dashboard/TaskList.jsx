import { Link } from 'react-router-dom'
import { Check, ListChecks, PartyPopper } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

const priorityColor = { Tinggi: 'bg-pink', Sedang: 'bg-yellow', Rendah: 'bg-mint' }

function TaskItem({ task, onToggle }) {
  return (
    <li className="flex items-center gap-3 rounded-brutal border-2 border-ink p-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Tandai selesai: ${task.title}`}
        onClick={() => onToggle(task.id)}
        className={`grid size-7 shrink-0 place-items-center rounded-md border-2 border-ink ${task.done ? 'bg-mint' : 'bg-surface'}`}
      >
        {task.done && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-bold ${task.done ? 'line-through opacity-60' : ''}`}>{task.title}</p>
        <p className="truncate text-sm text-ink/70">{task.course} · {task.due}</p>
      </div>
      <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
    </li>
  )
}

export default function TaskList({ tasks, onToggle }) {
  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <ListChecks className="size-5" aria-hidden="true" /> Tugas
        </h2>
        <Link to="/tugas" className="text-sm font-bold underline underline-offset-4">Lihat semua</Link>
      </div>

      {tasks.length === 0 || open.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Tidak ada tugas tertunda"
          description="Nikmati waktu luangmu atau tambahkan tugas baru."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {open.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <p className="mb-2 mt-5 text-sm font-bold text-ink/70">Selesai ({done.length})</p>
          <ul className="flex flex-col gap-3">
            {done.map((t) => <TaskItem key={t.id} task={t} onToggle={onToggle} />)}
          </ul>
        </>
      )}
    </Card>
  )
}
