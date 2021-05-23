import Head from 'next/head'
import { useEffect } from 'react'

import { Can } from '../components/Can'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { setupAPIClient } from '../services/api/apiClient'
import { withSSRAuth } from '../services/HighOrderFunctions/withSSRAuth'

export default function Dashboard(): JSX.Element {
  const { user, signOut } = useAuth()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/me')

        // console.log(data)
      } catch {}
    }

    fetchUser()
  }, [])

  return (
    <>
      <Head>
        <title>Dashboard - Secffy</title>
      </Head>

      <header>
        <button onClick={signOut}>SignOut</button>
      </header>

      <main>
        <h1>Dashboard: {user?.email}</h1>
        <Can permissions={['metrics.list']}>
          <h2>Metricas</h2>
        </Can>
      </main>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const apiClient = setupAPIClient(ctx)

  const { data } = await apiClient.get('me')

  // console.log(data)

  return {
    props: {}
  }
})
