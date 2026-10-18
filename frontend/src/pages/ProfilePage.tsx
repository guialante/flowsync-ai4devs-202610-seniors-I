import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'
import { FormAlert } from '@/components/FormAlert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiError, getProfile, logout, type User } from '@/lib/api'
import { toFormErrors } from '@/lib/errors'

export function ProfilePage() {
  const { token, signOut } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getProfile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // An expired or revoked token: drop it and RequireAuth sends us to login.
        if (err instanceof ApiError && err.status === 401) signOut()
        else setError(toFormErrors(err).general)
      })
    return () => {
      cancelled = true
    }
  }, [token, signOut])

  async function handleLogout() {
    // Clear the local session even if the server call fails.
    if (token) await logout(token).catch(() => undefined)
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Tu perfil</CardTitle>
        <CardDescription>Datos de tu cuenta en FlowSync.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormAlert message={error} />
        {!user && !error && (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        )}
        {user && (
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground"
            >
              {user.initials}
            </div>
            <dl className="grid gap-1 text-sm">
              {user.fullName && (
                <div>
                  <dt className="sr-only">Nombre</dt>
                  <dd className="font-medium">{user.fullName}</dd>
                </div>
              )}
              <div>
                <dt className="sr-only">Email</dt>
                <dd className={user.fullName ? 'text-muted-foreground' : ''}>
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">Miembro desde </dt>
                <dd className="inline text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('es')}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-6">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </CardFooter>
    </Card>
  )
}
