import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'
import { FormAlert } from '@/components/FormAlert'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signup } from '@/lib/api'
import { toFormErrors, type FormErrors } from '@/lib/errors'

// Mirrors backend/app/validators/user.ts so obvious mistakes skip the round trip.
function validate(
  email: string,
  password: string,
  passwordConfirmation: string,
): Record<string, string> {
  const fields: Record<string, string> = {}
  if (!/^\S+@\S+\.\S+$/.test(email)) fields.email = 'Introduce un email válido.'
  if (password.length < 8 || password.length > 32) {
    fields.password = 'La contraseña debe tener entre 8 y 32 caracteres.'
  }
  if (passwordConfirmation !== password) {
    fields.passwordConfirmation = 'Las contraseñas no coinciden.'
  }
  return fields
}

export function SignupPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<FormErrors>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = validate(email, password, passwordConfirmation)
    if (Object.keys(fields).length > 0) {
      setErrors({ fields })
      return
    }

    setSubmitting(true)
    setErrors({ fields: {} })
    try {
      const { token } = await signup({ email, password, passwordConfirmation })
      setToken(token)
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrors(toFormErrors(error))
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate con tu email y una contraseña.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          <FormAlert message={errors.general} />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.fields.email}
          />
          <FormField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={32}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.fields.password}
          />
          <FormField
            id="passwordConfirmation"
            label="Repite la contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            error={errors.fields.passwordConfirmation}
          />
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
