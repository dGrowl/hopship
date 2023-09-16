import { Dispatch, FormEvent, useReducer, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { NextRouter, useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { csrfHeaders, objectReducer } from '../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_REGEX,
} from '../lib/safety'
import { JWT_AUTH_SECRET } from '../lib/env'
import AntiCSRFForm from '../components/AntiCSRFForm'
import FallibleInput from '../components/FallibleInput'
import Field from '../components/Field'
import PasswordInput from '../components/PasswordInput'
import Preview from '../components/Preview'

import styles from '../styles/Login.module.css'

interface LoginFormFields extends EventTarget {
  csrf: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
}

const login = async (
  e: FormEvent,
  router: NextRouter,
  setBadValues: Dispatch<object>
) => {
  e.preventDefault()
  const fields = e.target as LoginFormFields
  const csrf = fields.csrf.value
  const email = fields.email.value
  const password = fields.password.value
  const data = { email, password }
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  if (response.status === 200) {
    router.push('/settings/identities')
  } else {
    const body = await response.json()
    switch (body.error) {
      case 'WRONG_PASSWORD':
        return setBadValues({ password })
      case 'UNKNOWN_EMAIL':
        return setBadValues({ email })
    }
  }
}

interface LoginFallibleValues {
  email: string
  password: string
}

const LoginForm = () => {
  const [badValues, setBadValues] = useReducer(
    objectReducer<LoginFallibleValues>,
    { email: '', password: '' }
  )
  const router = useRouter()
  return (
    <AntiCSRFForm onSubmit={(e) => login(e, router, setBadValues)}>
      <Field name="email">
        <FallibleInput
          autoComplete="email"
          badValue={badValues.email}
          id="email"
          maxLength={EMAIL_MAX_LENGTH}
          minLength={EMAIL_MIN_LENGTH}
          name="email"
          onChange={() => setBadValues({ password: '' })}
          pattern={EMAIL_REGEX}
          placeholder="user@e.mail"
          required
          type="email"
        >
          Email does not match any known users. Please enter a known email or
          register for a new account.
        </FallibleInput>
      </Field>
      <Field name="password">
        <PasswordInput
          autoComplete="current-password"
          badValue={badValues.password}
          id="password"
          name="password"
        >
          Password does not match that email. Please enter the correct password
          or register for a new account.
        </PasswordInput>
      </Field>
      <button>auth</button>
    </AntiCSRFForm>
  )
}

interface RegisterFormFields extends LoginFormFields {
  name: HTMLInputElement
  repassword: HTMLInputElement
}

const register = async (
  e: FormEvent,
  router: NextRouter,
  setBadValues: Dispatch<object>
) => {
  e.preventDefault()
  const fields = e.target as RegisterFormFields
  const csrf = fields.csrf.value
  const email = fields.email.value
  const password = fields.password.value
  const name = fields.name.value
  const repassword = fields.repassword.value
  if (password !== repassword) {
    return setBadValues({ password: repassword })
  }
  const data = { email, name, password }
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  if (response.status !== 200) {
    const body = await response.json()
    if (body.error === 'DUPLICATE_EMAIL') {
      return setBadValues({ email })
    }
    if (body.error === 'DUPLICATE_NAME') {
      return setBadValues({ name })
    }
  }
  const dataLogin = { email, password }
  const responseLogin = await fetch('/api/login', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(dataLogin),
  })
  if (responseLogin.status === 200) {
    router.push('/settings/identities')
  } else {
    router.reload()
  }
}

interface RegistrationFallibleValues extends LoginFallibleValues {
  name: string
}

const RegisterForm = () => {
  const [badValues, setBadValues] = useReducer(
    objectReducer<RegistrationFallibleValues>,
    {
      email: '',
      name: '',
      password: '',
    }
  )
  const [name, setName] = useState('')
  const router = useRouter()
  return (
    <AntiCSRFForm onSubmit={(e) => register(e, router, setBadValues)}>
      <Field name="email">
        <FallibleInput
          autoComplete="email"
          badValue={badValues.email}
          id="email"
          maxLength={EMAIL_MAX_LENGTH}
          minLength={EMAIL_MIN_LENGTH}
          name="email"
          pattern={EMAIL_REGEX}
          placeholder="user@e.mail"
          required
          type="email"
        >
          Email is already in use. Please enter a different one.
        </FallibleInput>
      </Field>
      <Field name="name">
        <FallibleInput
          autoComplete="username"
          badValue={badValues.name}
          id="name"
          maxLength={USER_NAME_MAX_LENGTH}
          minLength={USER_NAME_MIN_LENGTH}
          name="name"
          onChange={(e) => setName(e.target.value)}
          pattern={USER_NAME_REGEX}
          placeholder="user"
          required
          title="Usernames can only contain letters, numbers, and underscores."
        >
          Name is already in use. Please choose a different one.
        </FallibleInput>
        <Preview>also.domain/u/{name || 'user'}</Preview>
      </Field>
      <Field name="password">
        <PasswordInput
          autoComplete="new-password"
          id="password"
          name="password"
          onChange={() => setBadValues({ password: '' })}
        />
      </Field>
      <Field name="repassword" label="password (again)">
        <PasswordInput
          autoComplete="new-password"
          badValue={badValues.password}
          id="repassword"
          name="repassword"
        >
          Second password does not match the first. Please ensure that they
          match.
        </PasswordInput>
      </Field>
      <button>create</button>
    </AntiCSRFForm>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { auth: token } = ctx.req.cookies

  try {
    if (token) {
      jwt.verify(token, JWT_AUTH_SECRET)
      return {
        redirect: {
          destination: '/settings/identities',
          permanent: false,
        },
      }
    }
  } catch (error) {
    console.error(error)
  }

  return {
    props: {},
  }
}

const Login = () => {
  const [registerMode, setRegisterMode] = useState(false)
  return (
    <>
      <Head>
        <title>also: Login/Register</title>
      </Head>
      <div id={styles.container}>
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
          {registerMode ? <RegisterForm /> : <LoginForm />}
        </section>
      </div>
    </>
  )
}

export default Login
