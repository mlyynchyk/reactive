import { Container, Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectIsAdmin, selectUser } from '../store/authSlice'

const links = [
  { to: '/', label: 'Головна', icon: 'bi-house', end: true },
  { to: '/clients', label: 'Клієнти', icon: 'bi-people' },
  { to: '/accounts', label: 'Рахунки', icon: 'bi-wallet2' },
  { to: '/operations', label: 'Операції', icon: 'bi-arrow-left-right' },
]

export default function AppNavbar() {
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-semibold">
          <i className="bi bi-bank2 me-2 text-info" />
          Платіжна система
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {links.map((link) => (
              <Nav.Link key={link.to} as={NavLink} to={link.to} end={link.end}>
                <i className={`bi ${link.icon} me-1`} />
                {link.label}
              </Nav.Link>
            ))}
            {isAdmin && (
              <Nav.Link as={NavLink} to="/admin">
                <i className="bi bi-shield-lock me-1" />
                Адмін
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {user ? (
              <NavDropdown
                align="end"
                title={
                  <span>
                    <i className="bi bi-person-circle me-1" />
                    {user.username}
                  </span>
                }
              >
                <NavDropdown.ItemText className="small text-body-secondary">
                  Ролі:{' '}
                  {user.roles.map((role) => (
                    <Badge key={role} bg={role === 'Admin' ? 'danger' : 'primary'} className="me-1">
                      {role}
                    </Badge>
                  ))}
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Вийти
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  <i className="bi bi-box-arrow-in-right me-1" />
                  Увійти
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Реєстрація
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
