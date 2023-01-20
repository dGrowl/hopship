import { FormEvent, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { NextRouter, useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { jsonHeaders } from '../lib/util'
import Field from '../components/Field'

interface LoginFormFields extends EventTarget {
  email: HTMLInputElement
  password: HTMLInputElement
  name?: HTMLInputElement
  repassword?: HTMLInputElement
}

const processForm = async (
  e: FormEvent,
  registerMode: boolean,
  router: NextRouter
) => {
  e.preventDefault()
  const fields = e.target as LoginFormFields
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
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    if (response.status !== 200) {
      return
    }
  }
  const data = { email, password }
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  if (response.status === 200) {
    router.push('/profile')
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
          destination: '/profile',
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
  return (
    <>
      <Head>
        <title>Also: Login/Register</title>
      </Head>
      <section>
        <div>
          <button onClick={() => setRegisterMode(false)}>Login</button>
          <button onClick={() => setRegisterMode(true)}>Register</button>
        </div>
        <form onSubmit={(e) => processForm(e, registerMode, router)}>
          <Field name="email">
            <input name="email" type="email" />
          </Field>
          {registerMode ? (
            <>
              <Field name="name">
                <input name="name" />
              </Field>
            </>
          ) : null}
          <Field name="password">
            <input name="password" type="password" />
          </Field>
          {registerMode ? (
            <>
              <Field name="repassword" label="password (again)">
                <input name="repassword" type="password" />
              </Field>
            </>
          ) : null}
          <button>Submit</button>
        </form>
      </section>
    </>
  )
}
