import { Alert, Button, Modal, Spinner } from 'react-bootstrap'

export default function ConfirmModal({ show, title, children, error, busy, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0 small">
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Скасувати
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy && <Spinner size="sm" className="me-2" />}
          Видалити
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
