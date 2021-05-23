import { vaildateUserPermission } from '../../utils/validadeUserPermissions'
import { useAuth } from './useAuth'

type UseCamProps = {
  permissions?: string[]
  roles?: string[]
}

export function useCan({ permissions, roles }: UseCamProps): boolean {
  const { user, isAuthenticaded } = useAuth()

  if (!isAuthenticaded) {
    return false
  }

  const userHasValidPermission = vaildateUserPermission({
    user,
    permissions,
    roles
  })

  return userHasValidPermission
}
