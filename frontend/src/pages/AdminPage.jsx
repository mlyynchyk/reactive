import { Badge, Card, Col, Row, Table } from 'react-bootstrap'
import { api } from '../api/http'
import { useLoad } from '../utils/useLoad'
import PageHeader from '../components/PageHeader'
import LoadState from '../components/LoadState'

export default function AdminPage() {
  const { data: users, loading, error, reload } = useLoad(async () => (await api.adminUsers()).data, [])

  const admins = users.filter((u) => u.roles.includes('Admin')).length

  return (
    <>
      <PageHeader icon="bi-shield-lock" title="Адміністрування" subtitle="Користувачі системи та їхні ролі (доступно лише ROLE_Admin)" />

      <LoadState loading={loading} error={error} onRetry={reload}>
        <Row xs={1} sm={3} className="g-3 mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="fs-3 fw-semibold">{users.length}</div>
                <div className="text-body-secondary small">Користувачів</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="fs-3 fw-semibold text-danger">{admins}</div>
                <div className="text-body-secondary small">Адміністраторів</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="fs-3 fw-semibold text-primary">{users.length - admins}</div>
                <div className="text-body-secondary small">Звичайних користувачів</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Логін</th>
                <th>Ролі</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-body-secondary">#{u.id}</td>
                  <td>
                    <i className="bi bi-person-circle me-2 text-body-secondary" />
                    {u.username}
                  </td>
                  <td>
                    {u.roles.map((role) => (
                      <Badge key={role} bg={role === 'Admin' ? 'danger' : 'primary'} className="me-1">
                        {role}
                      </Badge>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </LoadState>
    </>
  )
}
