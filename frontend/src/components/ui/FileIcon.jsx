import { FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from 'lucide-react'
import { fileKind } from '@/lib/files'

const icons = { image: FileImage, sheet: FileSpreadsheet, slides: Presentation, archive: FileArchive, doc: FileText }

export default function FileIcon({ name, ...props }) {
  switch (fileKind(name)) {
    case 'image': return <icons.image {...props} />
    case 'sheet': return <icons.sheet {...props} />
    case 'slides': return <icons.slides {...props} />
    case 'archive': return <icons.archive {...props} />
    default: return <icons.doc {...props} />
  }
}
