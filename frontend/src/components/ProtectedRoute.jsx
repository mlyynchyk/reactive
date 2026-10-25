import { Navigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { Alert } from 'react-bootstrap'
import { selectUser } from '../store/authSlice'

/** Пускає на сторінку лише після входу; role="Admin" — лише адміністратора. */
export default function ProtectedRoute({ role, children }) {
  const user = useSelector(selectUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && !user.roles.includes(role)) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>
          <i className="bi bi-shield-x me-2" />
          Доступ заборонено (403)
        </Alert.Heading>
        Ця сторінка доступна лише користувачам з роллю <b>{role}</b>.
      </Alert>
    )
  }

  return children
}
