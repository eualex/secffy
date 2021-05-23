import { useContext } from 'react'
import { AuthContext, AuthContextData } from '../context/AuthContext'

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)

  if (!context.signIn) {
    throw new Error('useAuth must be used within a AuthProvider')
  }

  return context
}
