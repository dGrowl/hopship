import { FormEvent, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { NextRouter, useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { csrfHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'
import Field from '../components/Field'

import styles from '../styles/Login.module.css'

interface LoginFormFields extends EventTarget {
  csrf: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
  name?: HTMLInputElement
  repassword?: HTMLInputElement
}

const submit = async (
  e: FormEvent,
  registerMode: boolean,
  router: NextRouter
) => {
  e.preventDefault()
  const fields = e.target as LoginFormFields
  const csrf = fields.csrf.value
  const email = fields.email.value
  const password = fields.password.value
  if (registerMode) {
    if (!fields.name || !fields.repassword) {
      return
    }
    const name = fields.name.value
    const repassword = fields.repassword.value
    if (password !== repassword) {
      return
    }
    const data = { email, name, password }
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: csrfHeaders(csrf),
      body: JSON.stringify(data),
    })
    if (response.status !== 200) {
      return
    }
  }
  const data = { email, password }
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  if (response.status === 200) {
    router.push('/settings')
  } else {
    router.push('/login')
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { auth: token } = context.req.cookies

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw 'Environment is missing JWT secret'
    }
    if (token) {
      jwt.verify(token, process.env.JWT_AUTH_SECRET)
      return {
        redirect: {
          destination: '/settings',
          permanent: false,
        },
      }
    }
  } catch (error) {
    console.log(error)
  }

  return {
    props: {},
  }
}

export default function Login() {
  const [registerMode, setRegisterMode] = useState(false)
  const router = useRouter()
  const csrfCode = useCSRFCode()
  return (
    <>
      <Head>
        <title>Also: Login/Register</title>
      </Head>
      <section>
        <div id={styles.switcher}>
          <button
            className={registerMode ? '' : styles.activeMode}
            onClick={() => setRegisterMode(false)}
          >
            Login
          </button>
          <button
            className={registerMode ? styles.activeMode : ''}
            onClick={() => setRegisterMode(true)}
          >
            Register
          </button>
        </div>
        <form onSubmit={(e) => submit(e, registerMode, router)}>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="email">
            <input id="email" name="email" type="email" />
          </Field>
          {registerMode ? (
            <>
              <Field name="name">
                <input id="name" name="name" />
              </Field>
            </>
          ) : null}
          <Field name="password">
            <input id="password" name="password" type="password" />
          </Field>
          {registerMode ? (
            <>
              <Field name="repassword" label="password (again)">
                <input id="repassword" name="repassword" type="password" />
              </Field>
            </>
          ) : null}
          <button>{registerMode ? 'create' : 'verify'}</button>
        </form>
      </section>
    </>
  )
}
