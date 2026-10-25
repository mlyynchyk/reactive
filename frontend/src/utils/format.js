export function formatMoney(amount, currency = 'UAH') {
  const value = Number(amount ?? 0)
  try {
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export function formatDate(value, withTime = true) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

/** UA21 3223 1300 ... — групуємо IBAN по 4 символи для читабельності */
export function formatIban(iban) {
  return iban ? iban.replace(/(.{4})/g, '$1 ').trim() : '—'
}

export function shortIban(iban) {
  return iban ? `…${iban.slice(-6)}` : '—'
}

export const CURRENCIES = ['UAH', 'USD', 'EUR']

export const OPERATION_TYPES = {
  DEPOSIT:    { label: 'Поповнення', icon: 'bi-arrow-down-circle', sign: +1, color: 'success' },
  WITHDRAWAL: { label: 'Зняття',     icon: 'bi-cash-coin',         sign: -1, color: 'warning' },
  TRANSFER:   { label: 'Переказ',    icon: 'bi-arrow-left-right',  sign: -1, color: 'info' },
  PAYMENT:    { label: 'Оплата',     icon: 'bi-credit-card',       sign: -1, color: 'primary' },
  REFUND:     { label: 'Повернення', icon: 'bi-arrow-counterclockwise', sign: +1, color: 'secondary' },
}

export const OPERATION_STATUSES = {
  PENDING:   { label: 'Очікує',    bg: 'warning', text: 'dark' },
  COMPLETED: { label: 'Виконано',  bg: 'success' },
  FAILED:    { label: 'Помилка',   bg: 'danger' },
  CANCELLED: { label: 'Скасовано', bg: 'secondary' },
}
