import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { useAuth } from '../hooks/useAuth'

import styles from './signIn.module.scss'
import { GetServerSideProps } from 'next'
import { withSSRGuest } from '../services/HighOrderFunctions/withSSRGuest'

type SignInFormData = {
  email: string
  password: string
}

const signInSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  password: yup
    .string()
    .required('Senha obrigatória')
    .min(6, 'Minino de 6 caracteres')
})

export default function Home(): JSX.Element {
  const { signIn } = useAuth()

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(signInSchema)
  })

  const { errors } = formState

  const handleSignIn: SubmitHandler<SignInFormData> = async values => {
    await signIn(values)
  }

  return (
    <>
      <Head>
        <title>SignIn - secffy</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.wrapper}>
          <img src="security.svg" alt="Security" />

          <div className={styles.formContainer}>
            <h1>
              Bem-vindo ao <span>secffy</span>
            </h1>

            <form onSubmit={handleSubmit(handleSignIn)}>
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="E-mail"
                  {...register('email')}
                />
                {!!errors.email && <p>{errors.email.message}</p>}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  {...register('password')}
                />
                {errors.password && <p>{errors.password.message}</p>}
              </div>

              <button type="submit">Sign In</button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = withSSRGuest(async () => {
  return {
    props: {}
  }
})
