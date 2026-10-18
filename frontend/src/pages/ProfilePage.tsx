import { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, getProfile, logout, type User } from "@/lib/api";

export function ProfilePage() {
  const { token, clearToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getProfile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // An expired or revoked token sends the user back to login.
        if (err instanceof ApiError && err.status === 401) clearToken();
        else setError("No se pudo cargar tu perfil. Inténtalo de nuevo.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, clearToken]);

  async function handleLogout() {
    if (token) await logout(token).catch(() => undefined);
    clearToken();
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Tu perfil</CardTitle>
          <CardDescription>Has iniciado sesión en FlowSync.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!user && !error && (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
              >
                {user.initials}
              </div>
              <div className="grid">
                {user.fullName && (
                  <span className="font-medium">{user.fullName}</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
