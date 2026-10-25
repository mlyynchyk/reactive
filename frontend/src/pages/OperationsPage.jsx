import { useState } from 'react'
import { Alert, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { useSearchParams } from 'react-router'
import { api, errorMessage } from '../api/http'
import { useLoad } from '../utils/useLoad'
import { formatDate, formatMoney, OPERATION_STATUSES, OPERATION_TYPES, shortIban } from '../utils/format'
import PageHeader from '../components/PageHeader'
import LoadState from '../components/LoadState'
import ConfirmModal from '../components/ConfirmModal'
import { TypeLabel } from '../components/Badges'

const EMPTY = { accountId: '', type: 'PAYMENT', recipientId: '', amount: '', commission: '0', description: '' }

export default function OperationsPage() {
  const { data, loading, error, reload } = useLoad(
    async () => {
      const [operations, accounts, clients, recipients] = await Promise.all([
        api.operations(),
        api.accounts(),
        api.clients(),
        api.recipients(),
      ])
      return { operations: operations.data, accounts: accounts.data, clients: clients.data, recipients: recipients.data }
    },
    { operations: [], accounts: [], clients: [], recipients: [] },
  )
  const [params, setParams] = useSearchParams()
  const filters = {
    accountId: params.get('accountId') ?? '',
    status: params.get('status') ?? '',
    type: params.get('type') ?? '',
  }
  const [creating, setCreating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [formError, setFormError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const accountById = Object.fromEntries(data.accounts.map((a) => [a.id, a]))
  const clientById = Object.fromEntries(data.clients.map((c) => [c.id, c]))
  const recipientById = Object.fromEntries(data.recipients.map((r) => [r.id, r]))

  const accountLabel = (account) => {
    if (!account) return '—'
    const client = clientById[account.clientId]
    return `${client ? `${client.firstName} ${client.lastName}` : `#${account.clientId}`} · ${account.currency} ${shortIban(account.iban)}`
  }

  const operations = data.operations
    .filter((o) => !filters.accountId || String(o.accountId) === filters.accountId)
    .filter((o) => !filters.status || o.status === filters.status)
    .filter((o) => !filters.type || o.type === filters.type)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)))
  }

  const changeStatus = async (operation, status) => {
    setActionError(null)
    try {
      await api.updateOperation(operation.id, { ...operation, status })
      reload()
    } catch (err) {
      setActionError(errorMessage(err))
    }
  }

  const needsRecipient = creating && ['PAYMENT', 'TRANSFER'].includes(creating.type)

  const handleCreate = async (e) => {
    e.preventDefault()
    const account = accountById[creating.accountId]
    setBusy(true)
    setFormError(null)
    try {
      await api.createOperation({
        accountId: Number(creating.accountId),
        type: creating.type,
        recipientId: needsRecipient && creating.recipientId ? Number(creating.recipientId) : null,
        amount: Number(creating.amount),
        commission: Number(creating.commission || 0),
        currency: account.currency,
        description: creating.description.trim() || null,
      })
      setCreating(null)
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
      await api.deleteOperation(deleting.id)
      setDeleting(null)
      reload()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const selectedAccount = creating && accountById[creating.accountId]

  return (
    <>
      <PageHeader icon="bi-arrow-left-right" title="Платіжні операції" subtitle={`Показано ${operations.length} з ${data.operations.length}`}>
        <Button
          onClick={() => {
            setFormError(null)
            setCreating({ ...EMPTY, accountId: filters.accountId })
          }}
        >
          <i className="bi bi-plus-circle me-2" />
          Нова операція
        </Button>
      </PageHeader>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex flex-wrap gap-2">
          <Form.Select size="sm" value={filters.accountId} onChange={(e) => setFilter('accountId', e.target.value)} style={{ maxWidth: 320 }}>
            <option value="">Усі рахунки</option>
            {data.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountLabel(a)}
              </option>
            ))}
          </Form.Select>
          <Form.Select size="sm" value={filters.type} onChange={(e) => setFilter('type', e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">Усі типи</option>
            {Object.entries(OPERATION_TYPES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </Form.Select>
          <Form.Select size="sm" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">Усі статуси</option>
            {Object.entries(OPERATION_STATUSES).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </Form.Select>
          {(filters.accountId || filters.type || filters.status) && (
            <Button size="sm" variant="link" onClick={() => setParams({})}>
              Скинути фільтри
            </Button>
          )}
        </Card.Body>
      </Card>

      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <LoadState loading={loading} error={error} onRetry={reload}>
        <Card className="border-0 shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Рахунок</th>
                <th>Отримувач / опис</th>
                <th className="text-end">Сума</th>
                <th className="text-end">Комісія</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => {
                const sign = OPERATION_TYPES[o.type]?.sign ?? -1
                const recipient = recipientById[o.recipientId]
                return (
                  <tr key={o.id}>
                    <td className="small text-body-secondary text-nowrap">{formatDate(o.createdAt)}</td>
                    <td>
                      <TypeLabel type={o.type} />
                    </td>
                    <td className="small">{accountLabel(accountById[o.accountId])}</td>
                    <td>
                      {recipient && <div className="fw-medium">{recipient.name}</div>}
                      <div className="small text-body-secondary">{o.description ?? '—'}</div>
                    </td>
                    <td className={`text-end text-nowrap fw-semibold ${sign > 0 ? 'text-success' : ''}`}>
                      {sign > 0 ? '+' : '−'}
                      {formatMoney(o.amount, o.currency)}
                    </td>
                    <td className="text-end text-nowrap small text-body-secondary">{formatMoney(o.commission, o.currency)}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={o.status}
                        onChange={(e) => changeStatus(o, e.target.value)}
                        className={`status-select status-${o.status.toLowerCase()}`}
                        aria-label="Статус операції"
                      >
                        {Object.entries(OPERATION_STATUSES).map(([key, s]) => (
                          <option key={key} value={key}>
                            {s.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setFormError(null)
                          setDeleting(o)
                        }}
                        title="Видалити"
                      >
                        <i className="bi bi-trash" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {operations.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-body-secondary py-4">
                    Операцій не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </LoadState>

      <Modal show={Boolean(creating)} onHide={() => setCreating(null)} centered>
        {creating && (
          <Form onSubmit={handleCreate}>
            <Modal.Header closeButton>
              <Modal.Title className="h5">Нова операція</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              <Form.Group className="mb-3" controlId="op-account">
                <Form.Label>Рахунок</Form.Label>
                <Form.Select value={creating.accountId} onChange={(e) => setCreating({ ...creating, accountId: e.target.value })} required>
                  <option value="">Оберіть рахунок…</option>
                  {data.accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={!a.active}>
                      {accountLabel(a)} {a.active ? '' : '(заблоковано)'}
                    </option>
                  ))}
                </Form.Select>
                {selectedAccount && (
                  <Form.Text>Доступно: {formatMoney(selectedAccount.balance, selectedAccount.currency)}</Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="op-type">
                <Form.Label>Тип операції</Form.Label>
                <Form.Select value={creating.type} onChange={(e) => setCreating({ ...creating, type: e.target.value })}>
                  {Object.entries(OPERATION_TYPES).map(([key, t]) => (
                    <option key={key} value={key}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {needsRecipient && (
                <Form.Group className="mb-3" controlId="op-recipient">
                  <Form.Label>Отримувач</Form.Label>
                  <Form.Select value={creating.recipientId} onChange={(e) => setCreating({ ...creating, recipientId: e.target.value })}>
                    <option value="">Без отримувача</option>
                    {data.recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <div className="d-flex gap-3 mb-3">
                <Form.Group className="flex-fill" controlId="op-amount">
                  <Form.Label>Сума {selectedAccount && `(${selectedAccount.currency})`}</Form.Label>
                  <Form.Control type="number" step="0.01" min="0.01" value={creating.amount} onChange={(e) => setCreating({ ...creating, amount: e.target.value })} required />
                </Form.Group>
                <Form.Group className="flex-fill" controlId="op-commission">
                  <Form.Label>Комісія</Form.Label>
                  <Form.Control type="number" step="0.01" min="0" value={creating.commission} onChange={(e) => setCreating({ ...creating, commission: e.target.value })} />
                </Form.Group>
              </div>
              <Form.Group controlId="op-description">
                <Form.Label>Опис</Form.Label>
                <Form.Control value={creating.description} onChange={(e) => setCreating({ ...creating, description: e.target.value })} maxLength={500} placeholder="Наприклад: оплата за інтернет" />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setCreating(null)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Spinner size="sm" className="me-2" />}
                Створити
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      <ConfirmModal
        show={Boolean(deleting)}
        title="Видалити операцію?"
        error={formError}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      >
        Операцію на суму <b>{deleting && formatMoney(deleting.amount, deleting.currency)}</b> буде видалено з історії.
      </ConfirmModal>
    </>
  )
}
