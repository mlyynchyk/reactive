import { Button, Card, Col, Row, Table } from 'react-bootstrap'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { api } from '../api/http'
import { selectUser } from '../store/authSlice'
import { useLoad } from '../utils/useLoad'
import { formatDate, formatMoney, OPERATION_TYPES } from '../utils/format'
import LoadState from '../components/LoadState'
import { StatusBadge, TypeLabel } from '../components/Badges'

export default function HomePage() {
  const user = useSelector(selectUser)

  return (
    <>
      <div className="hero rounded-4 p-4 p-md-5 mb-4 text-white">
        <h1 className="display-6 fw-semibold mb-2">Управління платіжними операціями клієнтів</h1>
        <p className="lead mb-4 opacity-75">
          Клієнти, рахунки та платежі в одному місці. Реактивний бекенд на Spring WebFlux + R2DBC + PostgreSQL.
        </p>
        {user ? (
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/operations" variant="light">
              <i className="bi bi-plus-circle me-2" />
              Новий платіж
            </Button>
            <Button as={Link} to="/clients" variant="outline-light">
              Клієнти
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/login" variant="light">
              <i className="bi bi-box-arrow-in-right me-2" />
              Увійти
            </Button>
            <Button as={Link} to="/register" variant="outline-light">
              Зареєструватися
            </Button>
          </div>
        )}
      </div>

      {user ? <Dashboard /> : <Features />}
    </>
  )
}

function Dashboard() {
  const { data, loading, error, reload } = useLoad(
    async () => {
      const [clients, accounts, operations] = await Promise.all([api.clients(), api.accounts(), api.operations()])
      return { clients: clients.data, accounts: accounts.data, operations: operations.data }
    },
    { clients: [], accounts: [], operations: [] },
  )

  const balances = data.accounts.reduce((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + Number(a.balance)
    return acc
  }, {})
  const pending = data.operations.filter((o) => o.status === 'PENDING').length
  const blocked = data.accounts.filter((a) => !a.active).length
  const latest = [...data.operations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const ibanById = Object.fromEntries(data.accounts.map((a) => [a.id, a]))

  const stats = [
    { label: 'Клієнтів', value: data.clients.length, icon: 'bi-people', color: 'primary', to: '/clients' },
    { label: 'Рахунків', value: data.accounts.length, hint: blocked ? `${blocked} заблоковано` : 'усі активні', icon: 'bi-wallet2', color: 'success', to: '/accounts' },
    { label: 'Операцій', value: data.operations.length, hint: `${pending} очікують`, icon: 'bi-arrow-left-right', color: 'info', to: '/operations' },
  ]

  return (
    <LoadState loading={loading} error={error} onRetry={reload}>
      <Row xs={1} md={3} className="g-3 mb-4">
        {stats.map((s) => (
          <Col key={s.label}>
            <Card as={Link} to={s.to} className="stat-card h-100 text-decoration-none border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className={`stat-icon bg-${s.color}-subtle text-${s.color}`}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div>
                  <div className="fs-3 fw-semibold lh-1">{s.value}</div>
                  <div className="text-body-secondary small">
                    {s.label}
                    {s.hint && <> · {s.hint}</>}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-body fw-semibold">
              <i className="bi bi-cash-stack me-2" />
              Загальний баланс
            </Card.Header>
            <Card.Body>
              {Object.entries(balances).map(([currency, sum]) => (
                <div key={currency} className="d-flex justify-content-between border-bottom py-2">
                  <span className="text-body-secondary">{currency}</span>
                  <span className="fw-semibold">{formatMoney(sum, currency)}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-body fw-semibold d-flex justify-content-between">
              <span>
                <i className="bi bi-clock-history me-2" />
                Останні операції
              </span>
              <Link to="/operations" className="small">
                Усі операції →
              </Link>
            </Card.Header>
            <Table responsive hover className="mb-0 align-middle">
              <tbody>
                {latest.map((o) => {
                  const sign = OPERATION_TYPES[o.type]?.sign ?? -1
                  return (
                    <tr key={o.id}>
                      <td className="small text-body-secondary text-nowrap">{formatDate(o.createdAt)}</td>
                      <td>
                        <TypeLabel type={o.type} />
                        <div className="small text-body-secondary">{o.description}</div>
                      </td>
                      <td className={`text-end text-nowrap fw-semibold ${sign > 0 ? 'text-success' : ''}`}>
                        {sign > 0 ? '+' : '−'}
                        {formatMoney(o.amount, o.currency ?? ibanById[o.accountId]?.currency)}
                      </td>
                      <td className="text-end">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </LoadState>
  )
}

function Features() {
  const items = [
    { icon: 'bi-people', title: 'Клієнти', text: 'Облік клієнтів платіжної системи та їхніх рахунків.' },
    { icon: 'bi-wallet2', title: 'Рахунки', text: 'Рахунки в UAH, USD та EUR з балансом і статусом блокування.' },
    { icon: 'bi-arrow-left-right', title: 'Операції', text: 'Платежі, поповнення, перекази та повернення коштів.' },
    { icon: 'bi-shield-lock', title: 'Безпека', text: 'Вхід через Spring Security, окремі права для адміністратора.' },
  ]
  return (
    <Row xs={1} md={2} lg={4} className="g-3">
      {items.map((item) => (
        <Col key={item.title}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <i className={`bi ${item.icon} fs-2 text-primary`} />
              <h2 className="h5 mt-2">{item.title}</h2>
              <p className="text-body-secondary mb-0">{item.text}</p>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
