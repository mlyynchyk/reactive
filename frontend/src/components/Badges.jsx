import { Badge } from 'react-bootstrap'
import { OPERATION_STATUSES, OPERATION_TYPES } from '../utils/format'

export function StatusBadge({ status }) {
  const s = OPERATION_STATUSES[status] ?? { label: status, bg: 'light', text: 'dark' }
  return (
    <Badge bg={s.bg} text={s.text} pill>
      {s.label}
    </Badge>
  )
}

export function TypeLabel({ type }) {
  const t = OPERATION_TYPES[type] ?? { label: type, icon: 'bi-question-circle', color: 'secondary' }
  return (
    <span className="text-nowrap">
      <i className={`bi ${t.icon} text-${t.color} me-1`} />
      {t.label}
    </span>
  )
}

export function AccountStatusBadge({ active }) {
  return active ? (
    <Badge bg="success-subtle" text="success-emphasis" pill>
      <i className="bi bi-check-circle me-1" />
      Активний
    </Badge>
  ) : (
    <Badge bg="danger-subtle" text="danger-emphasis" pill>
      <i className="bi bi-lock me-1" />
      Заблокований
    </Badge>
  )
}
