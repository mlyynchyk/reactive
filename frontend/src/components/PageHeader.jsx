export default function PageHeader({ icon, title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">
          <i className={`bi ${icon} me-2 text-primary`} />
          {title}
        </h1>
        {subtitle && <p className="text-body-secondary mb-0">{subtitle}</p>}
      </div>
      <div className="d-flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
