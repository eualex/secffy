import axios, { AxiosError, AxiosInstance } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../../context/AuthContext'
import { AuthTokenError } from './errors/AuthTokenError'

type FailedRequestQueueData = {
  onSuccess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

let isRefreshing = false
let failedRequestQueue: FailedRequestQueueData[] = []

export function setupAPIClient(ctx = undefined): AxiosInstance {
  let cookies = parseCookies(ctx)

  const token = cookies['nextauth.token']

  const api = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response?.data.code === 'token.expired') {
          cookies = parseCookies(ctx)

          const refreshToken = cookies['nextauth.refreshToken']
          const originalConfig = error.config

          if (!isRefreshing) {
            isRefreshing = true

            api
              .post('/refresh', {
                refreshToken
              })
              .then(({ data }) => {
                const { token } = data

                setCookie(ctx, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                })

                setCookie(ctx, 'nextauth.refreshToken', data.refreshToken, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                })

                api.defaults.headers.Authorization = `Bearer ${token}`

                failedRequestQueue.forEach(request => request.onSuccess(token))

                failedRequestQueue = []
              })
              .catch(error => {
                failedRequestQueue.forEach(request => request.onFailure(error))

                if (process.browser) {
                  signOut()
                } else {
                  Promise.reject(new AuthTokenError())
                }
              })
              .finally(() => {
                isRefreshing = false
              })
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`

                resolve(api(originalConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              }
            })
          })
        } else {
          if (process.browser) {
            signOut()
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}
