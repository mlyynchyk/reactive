import { useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router'
import { api, errorMessage } from '../api/http'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Паролі не збігаються')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.register({ username: form.username, password: form.password })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-wrapper">
      <Card className="border-0 shadow">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus fs-1 text-primary" />
            <h1 className="h4 mt-2 mb-0">Реєстрація</h1>
            <p className="text-body-secondary small mb-0">Новий користувач отримує роль User</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="reg-username">
              <Form.Label>Логін</Form.Label>
              <Form.Control value={form.username} onChange={set('username')} autoFocus required maxLength={100} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="reg-password">
              <Form.Label>Пароль</Form.Label>
              <Form.Control type="password" value={form.password} onChange={set('password')} required maxLength={100} />
            </Form.Group>
            <Form.Group className="mb-4" controlId="reg-confirm">
              <Form.Label>Повторіть пароль</Form.Label>
              <Form.Control
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                isInvalid={form.confirm.length > 0 && form.confirm !== form.password}
              />
              <Form.Control.Feedback type="invalid">Паролі не збігаються</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={busy}>
              {busy && <Spinner size="sm" className="me-2" />}
              Зареєструватися
            </Button>
          </Form>

          <div className="text-center mt-3 small">
            Вже є акаунт? <Link to="/login">Увійти</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
