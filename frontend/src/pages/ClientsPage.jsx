import { useState } from 'react'
import { Alert, Badge, Button, Card, Form, InputGroup, Modal, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router'
import { api, errorMessage } from '../api/http'
import { useLoad } from '../utils/useLoad'
import PageHeader from '../components/PageHeader'
import LoadState from '../components/LoadState'
import ConfirmModal from '../components/ConfirmModal'

const EMPTY = { firstName: '', lastName: '', age: '' }

export default function ClientsPage() {
  const { data, loading, error, reload } = useLoad(
    async () => {
      const [clients, accounts] = await Promise.all([api.clients(), api.accounts()])
      return { clients: clients.data, accounts: accounts.data }
    },
    { clients: [], accounts: [] },
  )
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null | {id?, firstName, lastName, age}
  const [deleting, setDeleting] = useState(null)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const accountsCount = data.accounts.reduce((acc, a) => ({ ...acc, [a.clientId]: (acc[a.clientId] ?? 0) + 1 }), {})
  const query = search.trim().toLowerCase()
  const clients = data.clients
    .filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(query))
    .sort((a, b) => a.id - b.id)

  const openForm = (client) => {
    setFormError(null)
    setEditing(client ? { ...client } : { ...EMPTY })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    const body = { firstName: editing.firstName.trim(), lastName: editing.lastName.trim(), age: Number(editing.age) }
    try {
      if (editing.id) await api.updateClient(editing.id, body)
      else await api.createClient(body)
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    setFormError(null)
    try {
      await api.deleteClient(deleting.id)
      setDeleting(null)
      reload()
    } catch (err) {
      setFormError(
        err.response?.status === 409 ? 'Неможливо видалити клієнта, у якого є рахунки. Спочатку видаліть його рахунки.' : errorMessage(err),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader icon="bi-people" title="Клієнти" subtitle={`Усього: ${data.clients.length}`}>
        <InputGroup style={{ maxWidth: 260 }}>
          <InputGroup.Text>
            <i className="bi bi-search" />
          </InputGroup.Text>
          <Form.Control placeholder="Пошук за ім'ям" value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        <Button onClick={() => openForm(null)}>
          <i className="bi bi-person-plus me-2" />
          Додати клієнта
        </Button>
      </PageHeader>

      <LoadState loading={loading} error={error} onRetry={reload}>
        <Card className="border-0 shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Клієнт</th>
                <th>Вік</th>
                <th>Рахунки</th>
                <th className="text-end">Дії</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="text-body-secondary">#{c.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar">{c.firstName[0]}{c.lastName[0]}</span>
                      <span className="fw-medium">
                        {c.firstName} {c.lastName}
                      </span>
                    </div>
                  </td>
                  <td>{c.age}</td>
                  <td>
                    <Link to={`/accounts?clientId=${c.id}`} className="text-decoration-none">
                      <Badge bg="primary-subtle" text="primary-emphasis" pill>
                        <i className="bi bi-wallet2 me-1" />
                        {accountsCount[c.id] ?? 0}
                      </Badge>
                    </Link>
                  </td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openForm(c)} title="Редагувати">
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        setFormError(null)
                        setDeleting(c)
                      }}
                      title="Видалити"
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-body-secondary py-4">
                    Клієнтів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </LoadState>

      <Modal show={Boolean(editing)} onHide={() => setEditing(null)} centered>
        {editing && (
          <Form onSubmit={handleSave}>
            <Modal.Header closeButton>
              <Modal.Title className="h5">{editing.id ? `Редагування клієнта #${editing.id}` : 'Новий клієнт'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>Ім&apos;я</Form.Label>
                <Form.Control value={editing.firstName} onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} required maxLength={100} autoFocus />
              </Form.Group>
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Прізвище</Form.Label>
                <Form.Control value={editing.lastName} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} required maxLength={100} />
              </Form.Group>
              <Form.Group controlId="age">
                <Form.Label>Вік</Form.Label>
                <Form.Control type="number" min={14} max={120} value={editing.age} onChange={(e) => setEditing({ ...editing, age: e.target.value })} required />
                <Form.Text>Не менше 14 років</Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Spinner size="sm" className="me-2" />}
                Зберегти
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      <ConfirmModal
        show={Boolean(deleting)}
        title="Видалити клієнта?"
        error={formError}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      >
        Клієнта <b>{deleting?.firstName} {deleting?.lastName}</b> буде видалено назавжди.
      </ConfirmModal>
    </>
  )
}
