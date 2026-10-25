import { useState } from 'react'
import { Alert, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router'
import { api, errorMessage } from '../api/http'
import { useLoad } from '../utils/useLoad'
import { CURRENCIES, formatDate, formatIban, formatMoney } from '../utils/format'
import PageHeader from '../components/PageHeader'
import LoadState from '../components/LoadState'
import ConfirmModal from '../components/ConfirmModal'
import { AccountStatusBadge } from '../components/Badges'

const EMPTY = { clientId: '', iban: 'UA', currency: 'UAH', balance: '0' }

export default function AccountsPage() {
  const { data, loading, error, reload } = useLoad(
    async () => {
      const [accounts, clients] = await Promise.all([api.accounts(), api.clients()])
      return { accounts: accounts.data, clients: clients.data }
    },
    { accounts: [], clients: [] },
  )
  const [params, setParams] = useSearchParams()
  const clientFilter = params.get('clientId') ?? ''
  const [creating, setCreating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [formError, setFormError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const clientById = Object.fromEntries(data.clients.map((c) => [c.id, c]))
  const accounts = data.accounts
    .filter((a) => !clientFilter || String(a.clientId) === clientFilter)
    .sort((a, b) => a.id - b.id)

  const setClientFilter = (value) => setParams(value ? { clientId: value } : {})

  const toggleActive = async (account) => {
    setActionError(null)
    try {
      await api.updateAccount(account.id, { ...account, active: !account.active })
      reload()
    } catch (err) {
      setActionError(errorMessage(err))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      await api.createAccount({
        clientId: Number(creating.clientId),
        iban: creating.iban.replace(/\s/g, '').toUpperCase(),
        currency: creating.currency,
        balance: Number(creating.balance),
      })
      setCreating(null)
      reload()
    } catch (err) {
      setFormError(err.response?.status === 409 ? 'Рахунок з таким IBAN уже існує' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    setFormError(null)
    try {
      await api.deleteAccount(deleting.id)
      setDeleting(null)
      reload()
    } catch (err) {
      setFormError(err.response?.status === 409 ? 'Неможливо видалити рахунок, за яким є операції або картки.' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const filteredClient = clientById[clientFilter]

  return (
    <>
      <PageHeader
        icon="bi-wallet2"
        title="Рахунки"
        subtitle={filteredClient ? `Рахунки клієнта ${filteredClient.firstName} ${filteredClient.lastName}` : `Усього: ${data.accounts.length}`}
      >
        <Form.Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={{ maxWidth: 260 }}>
          <option value="">Усі клієнти</option>
          {data.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </Form.Select>
        <Button
          onClick={() => {
            setFormError(null)
            setCreating({ ...EMPTY, clientId: clientFilter })
          }}
        >
          <i className="bi bi-plus-lg me-2" />
          Відкрити рахунок
        </Button>
      </PageHeader>

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
                <th>IBAN</th>
                <th>Клієнт</th>
                <th>Валюта</th>
                <th className="text-end">Баланс</th>
                <th>Відкрито</th>
                <th>Статус</th>
                <th className="text-end">Дії</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const client = clientById[a.clientId]
                return (
                  <tr key={a.id} className={a.active ? '' : 'table-row-muted'}>
                    <td className="font-monospace small">{formatIban(a.iban)}</td>
                    <td>{client ? `${client.firstName} ${client.lastName}` : `#${a.clientId}`}</td>
                    <td>{a.currency}</td>
                    <td className="text-end fw-semibold text-nowrap">{formatMoney(a.balance, a.currency)}</td>
                    <td className="small text-body-secondary text-nowrap">{formatDate(a.openedAt, false)}</td>
                    <td>
                      <AccountStatusBadge active={a.active} />
                    </td>
                    <td className="text-end text-nowrap">
                      <Button as={Link} to={`/operations?accountId=${a.id}`} size="sm" variant="outline-primary" className="me-2" title="Операції">
                        <i className="bi bi-list-ul" />
                      </Button>
                      <Button
                        size="sm"
                        variant={a.active ? 'outline-warning' : 'outline-success'}
                        className="me-2"
                        onClick={() => toggleActive(a)}
                        title={a.active ? 'Заблокувати' : 'Розблокувати'}
                      >
                        <i className={`bi ${a.active ? 'bi-lock' : 'bi-unlock'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setFormError(null)
                          setDeleting(a)
                        }}
                        title="Видалити"
                      >
                        <i className="bi bi-trash" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">
                    Рахунків не знайдено
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
              <Modal.Title className="h5">Відкриття рахунку</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              <Form.Group className="mb-3" controlId="acc-client">
                <Form.Label>Клієнт</Form.Label>
                <Form.Select value={creating.clientId} onChange={(e) => setCreating({ ...creating, clientId: e.target.value })} required>
                  <option value="">Оберіть клієнта…</option>
                  {data.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="acc-iban">
                <Form.Label>IBAN</Form.Label>
                <Form.Control
                  className="font-monospace"
                  value={creating.iban}
                  onChange={(e) => setCreating({ ...creating, iban: e.target.value })}
                  required
                  pattern="[A-Za-z]{2}[0-9 ]{10,40}"
                  placeholder="UA21 3223 1300 0002 6007 2335 6600 1"
                />
                <Form.Text>Наприклад: UA213223130000026007233566001</Form.Text>
              </Form.Group>
              <div className="d-flex gap-3">
                <Form.Group className="flex-fill" controlId="acc-currency">
                  <Form.Label>Валюта</Form.Label>
                  <Form.Select value={creating.currency} onChange={(e) => setCreating({ ...creating, currency: e.target.value })}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="flex-fill" controlId="acc-balance">
                  <Form.Label>Початковий баланс</Form.Label>
                  <Form.Control type="number" step="0.01" min="0" value={creating.balance} onChange={(e) => setCreating({ ...creating, balance: e.target.value })} required />
                </Form.Group>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setCreating(null)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Spinner size="sm" className="me-2" />}
                Відкрити
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      <ConfirmModal
        show={Boolean(deleting)}
        title="Видалити рахунок?"
        error={formError}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      >
        Рахунок <span className="font-monospace">{formatIban(deleting?.iban)}</span> буде видалено назавжди.
      </ConfirmModal>
    </>
  )
}
