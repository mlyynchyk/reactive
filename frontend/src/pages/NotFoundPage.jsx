import { Button } from 'react-bootstrap'
import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <div className="display-1 fw-bold text-body-tertiary">404</div>
      <p className="lead">Сторінку не знайдено</p>
      <Button as={Link} to="/">
        На головну
      </Button>
    </div>
  )
}
