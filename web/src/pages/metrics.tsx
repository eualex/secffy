import Head from 'next/head'

import { setupAPIClient } from '../services/api/apiClient'
import { withSSRAuth } from '../services/HighOrderFunctions/withSSRAuth'

export default function Metrics(): JSX.Element {
  return (
    <>
      <Head>
        <title>Metrics - Secffy</title>
      </Head>

      <h2>Metricas</h2>
    </>
  )
}

export const getServerSideProps = withSSRAuth(
  async ctx => {
    const apiClient = setupAPIClient(ctx)

    const { data } = await apiClient.get('me')

    // console.log(data)

    return {
      props: {}
    }
  },
  {
    permissions: ['metrics.list3'],
    roles: ['administrator']
  }
)
