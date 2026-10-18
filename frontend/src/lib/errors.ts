import { ApiError, type ApiFieldError } from '@/lib/api'

export type FormErrors = {
  general?: string
  fields: Record<string, string>
}

const NETWORK_ERROR = 'No se pudo conectar con el servidor. Inténtalo de nuevo.'

const FIELD_LABELS: Record<string, string> = {
  email: 'El email',
  password: 'La contraseña',
  passwordConfirmation: 'La confirmación de contraseña',
}

function fieldMessage({ field, rule, message }: ApiFieldError): string {
  if (field === 'email' && rule === 'database.unique') {
    return 'Este email ya está registrado.'
  }
  if (field === 'passwordConfirmation' && rule === 'sameAs') {
    return 'Las contraseñas no coinciden.'
  }
  const label = (field && FIELD_LABELS[field]) ?? 'Este campo'
  switch (rule) {
    case 'required':
      return `${label} es obligatorio.`
    case 'email':
      return 'Introduce un email válido.'
    case 'minLength':
      return `${label} es demasiado corto.`
    case 'maxLength':
      return `${label} es demasiado largo.`
    default:
      return message
  }
}

// Turns any error thrown by the API client into messages a form can show.
export function toFormErrors(error: unknown): FormErrors {
  if (!(error instanceof ApiError) || error.status === 0) {
    return { general: NETWORK_ERROR, fields: {} }
  }
  if (error.status >= 500) {
    return {
      general: 'El servidor tuvo un problema. Inténtalo de nuevo más tarde.',
      fields: {},
    }
  }

  const fields: Record<string, string> = {}
  const general: string[] = []
  for (const item of error.errors) {
    if (item.field && !fields[item.field]) {
      fields[item.field] = fieldMessage(item)
    } else if (!item.field) {
      general.push(item.message)
    }
  }

  return {
    general:
      general[0] ??
      (Object.keys(fields).length === 0 ? error.message : undefined),
    fields,
  }
}

// Login hides which of email or password was wrong, so 400 gets one message.
export function toLoginErrors(error: unknown): FormErrors {
  if (error instanceof ApiError && error.status === 400) {
    return { general: 'Email o contraseña incorrectos.', fields: {} }
  }
  return toFormErrors(error)
}
