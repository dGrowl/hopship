import { FormEvent, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { NextRouter, useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { jsonHeaders } from '../lib/util'

interface LoginFormFields extends EventTarget {
  email: HTMLInputElement
  password: HTMLInputElement
  tag?: HTMLInputElement
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
    if (!fields.tag || !fields.repassword) {
      return
    }
    const tag = fields.tag.value
    const repassword = fields.repassword.value
    if (password !== repassword) {
      return
    }
    const data = { email, tag, password }
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
      <div>
        <div>
          <button onClick={() => setRegisterMode(false)}>Login</button>
          <button onClick={() => setRegisterMode(true)}>Register</button>
        </div>
        <form onSubmit={(e) => processForm(e, registerMode, router)}>
          <label htmlFor="email">Email</label>
          <input name="email" type="email" />
          {registerMode ? (
            <>
              <label htmlFor="tag">ID</label>
              <input name="tag" />
            </>
          ) : null}
          <label htmlFor="password">Password</label>
          <input name="password" type="password" />
          {registerMode ? (
            <>
              <label htmlFor="repassword">Password (Again)</label>
              <input name="repassword" type="password" />
            </>
          ) : null}
          <button>Submit</button>
        </form>
      </div>
    </>
  )
}
