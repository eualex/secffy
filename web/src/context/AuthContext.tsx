import { createContext, ReactNode, useEffect, useState } from 'react'
import { setCookie, destroyCookie } from 'nookies'
import Router from 'next/router'

import { api } from '../services/api'

type User = {
  email: string
  permissions: string[]
  roles: string[]
}

type SignInCredentials = {
  email: string
  password: string
}

let authChannel: BroadcastChannel

export type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => void
  isAuthenticaded: boolean
  user: User
}

interface AuthContextProviderProps {
  children?: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut(): void {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  if (process.browser) {
    if (Router.asPath !== '/') {
      authChannel.postMessage('signOut')
    }
  }

  Router.push('/')
}

export function AuthProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User>()
  const isAuthenticaded = !!user

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const { data } = await api.post('sessions', {
        email,
        password
      })

      authChannel.close()
      authChannel = new BroadcastChannel('auth')

      const { token, refreshToken, permissions, roles } = data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers.Authorization = `Bearer ${token}`

      authChannel.postMessage('signIn')

      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function handleUserDataRevalidation() {
      try {
        const { data } = await api.get('/me')

        const { email, permissions, roles } = data

        setUser(() => ({
          email,
          permissions,
          roles
        }))
      } catch {
        signOut()
      }
    }

    if (Router.asPath !== '/') {
      handleUserDataRevalidation()
    }
  }, [])

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          signOut()
          break
        case 'signIn':
          Router.push('/dashboard')
          break
        default:
          break
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticaded, signIn, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
