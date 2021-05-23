import { ReactNode } from 'react'
import { useCan } from '../hooks/useCan'

interface CanProps {
  children: ReactNode
  permissions?: string[]
  roles?: string[]
}

export function Can({ children, permissions, roles }: CanProps): JSX.Element {
  const userCanSeeComponent = useCan({ permissions, roles })

  if (!userCanSeeComponent) {
    return null
  }

  return <>{children}</>
}
