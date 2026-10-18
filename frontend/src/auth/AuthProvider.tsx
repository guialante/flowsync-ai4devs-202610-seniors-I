import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from '@/auth/auth-context'

const STORAGE_KEY = 'flowsync.token'

// Storage can throw (private mode, blocked site data); fall back to memory.
function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // The session still works for this tab without persistence.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(readToken)

  const setToken = useCallback((next: string) => {
    writeToken(next)
    setTokenState(next)
  }, [])

  const signOut = useCallback(() => {
    writeToken(null)
    setTokenState(null)
  }, [])

  const value = useMemo(
    () => ({ token, setToken, signOut }),
    [token, setToken, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
