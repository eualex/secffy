import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import decode from 'jwt-decode'

import { AuthTokenError } from '../api/errors/AuthTokenError'
import { vaildateUserPermission } from '../../../utils/validadeUserPermissions'

type OptionsProps = {
  permissions?: string[]
  roles?: string[]
}

type User = {
  permissions: string[]
  roles: string[]
}

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: OptionsProps
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)
    const token = cookies['nextauth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if (options) {
      const user = decode<User>(token)
      const { permissions, roles } = options

      const userHasValidPermission = vaildateUserPermission({
        user,
        permissions,
        roles
      })

      if (!userHasValidPermission) {
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }

    try {
      return fn(ctx)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}
