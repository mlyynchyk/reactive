import { Alert, Button, Spinner } from 'react-bootstrap'

/** Спінер під час завантаження або повідомлення про помилку з кнопкою "Повторити". */
export default function LoadState({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="text-center py-5 text-body-secondary">
        <Spinner animation="border" className="mb-2" />
        <div>Завантаження…</div>
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="danger" className="d-flex align-items-center justify-content-between">
        <span>
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </span>
        {onRetry && (
          <Button size="sm" variant="outline-danger" onClick={onRetry}>
            Повторити
          </Button>
        )}
      </Alert>
    )
  }
  return children
}
