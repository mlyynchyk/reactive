import { useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { login, selectUser } from '../store/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectUser)
  const { status, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ username: '', password: '' })

  const from = location.state?.from ?? '/'
  const justRegistered = location.state?.registered

  if (user) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) navigate(from, { replace: true })
  }

  const fillDemo = (username) => setForm({ username, password: username })

  return (
    <div className="auth-wrapper">
      <Card className="border-0 shadow">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="bi bi-person-lock fs-1 text-primary" />
            <h1 className="h4 mt-2 mb-0">Вхід до системи</h1>
          </div>

          {justRegistered && <Alert variant="success">Реєстрація успішна! Тепер увійдіть.</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Логін</Form.Label>
              <Form.Control
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={status === 'loading'}>
              {status === 'loading' && <Spinner size="sm" className="me-2" />}
              Увійти
            </Button>
          </Form>

          <div className="text-center mt-3 small">
            Немає акаунта? <Link to="/register">Зареєструватися</Link>
          </div>
        </Card.Body>
        <Card.Footer className="bg-body-tertiary small text-body-secondary">
          Тестові акаунти:{' '}
          <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => fillDemo('1111')}>
            1111
          </Button>{' '}
          (адмін),{' '}
          <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => fillDemo('2222')}>
            2222
          </Button>{' '}
          (користувач). Пароль = логін.
        </Card.Footer>
      </Card>
    </div>
  )
}
