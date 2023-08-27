import { BsExclamationCircle } from 'react-icons/bs'
import { Dispatch, FormEvent, ReactNode, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { NextRouter, useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { csrfHeaders } from '../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_REGEX,
} from '../lib/safety'
import AntiCSRFForm from '../components/AntiCSRFForm'
import Field from '../components/Field'

import styles from '../styles/Login.module.css'
import Preview from '../components/Preview'

const ErrorDescription = ({ children }: { children: ReactNode }) => (
  <div className={styles.errorDescription}>
    <BsExclamationCircle size={24} strokeWidth={0.75} />
    {children}
  </div>
)

interface LoginFormFields extends EventTarget {
  csrf: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
}

const login = async (
  e: FormEvent,
  router: NextRouter,
  setBadEmail: Dispatch<string>,
  setBadPassword: Dispatch<string>
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
        return setBadPassword(password)
      case 'UNKNOWN_EMAIL':
        return setBadEmail(email)
    }
  }
}

const LoginForm = () => {
  const [badEmail, setBadEmail] = useState('')
  const [badPassword, setBadPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const hasEmailError = badEmail && email === badEmail
  const hasPasswordError = badPassword && password === badPassword
  return (
    <AntiCSRFForm
      onSubmit={(e) => login(e, router, setBadEmail, setBadPassword)}
    >
      <Field name="email">
        <input
          autoComplete="email"
          className={hasEmailError ? styles.errorInput : ''}
          id="email"
          maxLength={EMAIL_MAX_LENGTH}
          minLength={EMAIL_MIN_LENGTH}
          name="email"
          onChange={(e) => {
            setEmail(e.target.value)
            setBadPassword('')
          }}
          pattern={EMAIL_REGEX}
          placeholder="user@e.mail"
          required
          type="email"
        />
        {hasEmailError ? (
          <ErrorDescription>
            Email does not match any known users. Please enter a known email or
            register for a new account.
          </ErrorDescription>
        ) : null}
      </Field>
      <Field name="password">
        <input
          autoComplete="current-password"
          className={hasPasswordError ? styles.errorInput : ''}
          id="password"
          maxLength={PASSWORD_MAX_LENGTH}
          minLength={PASSWORD_MIN_LENGTH}
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
        />
        {hasPasswordError ? (
          <ErrorDescription>
            Password does not match that email. Please enter the correct
            password or register for a new account.
          </ErrorDescription>
        ) : null}
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
  setBadEmail: Dispatch<string>,
  setBadName: Dispatch<string>,
  setBadPassword: Dispatch<string>
) => {
  e.preventDefault()
  const fields = e.target as RegisterFormFields
  const csrf = fields.csrf.value
  const email = fields.email.value
  const password = fields.password.value
  const name = fields.name.value
  const repassword = fields.repassword.value
  if (password !== repassword) {
    return setBadPassword(repassword)
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
      return setBadEmail(email)
    }
    if (body.error === 'DUPLICATE_NAME') {
      return setBadName(name)
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

const RegisterForm = () => {
  const [name, setName] = useState('')
  const [badName, setBadName] = useState('')
  const [email, setEmail] = useState('')
  const [badEmail, setBadEmail] = useState('')
  const [password, setPassword] = useState('')
  const [badPassword, setBadPassword] = useState('')
  const router = useRouter()
  const hasNameError = badName && name === badName
  const hasPasswordError = badPassword && password === badPassword
  const hasEmailError = badEmail && email === badEmail
  return (
    <AntiCSRFForm
      onSubmit={(e) =>
        register(e, router, setBadEmail, setBadName, setBadPassword)
      }
    >
      <Field name="email">
        <input
          autoComplete="email"
          className={hasEmailError ? styles.errorInput : ''}
          id="email"
          maxLength={EMAIL_MAX_LENGTH}
          minLength={EMAIL_MIN_LENGTH}
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          pattern={EMAIL_REGEX}
          placeholder="user@e.mail"
          required
          type="email"
        />
        {hasEmailError ? (
          <ErrorDescription>
            Email does not match any known users. Please enter a known email or
            register for a new account.
          </ErrorDescription>
        ) : null}
      </Field>
      <Field name="name">
        <input
          autoComplete="username"
          className={hasNameError ? styles.errorInput : ''}
          id="name"
          maxLength={USER_NAME_MAX_LENGTH}
          minLength={USER_NAME_MIN_LENGTH}
          name="name"
          onChange={(e) => setName(e.target.value)}
          pattern={USER_NAME_REGEX}
          placeholder="user"
          required
          title="Usernames can only contain letters, numbers, and underscores."
        />
        {hasNameError ? (
          <ErrorDescription>
            Name is already in use. Please choose a different one.
          </ErrorDescription>
        ) : null}
        <Preview>also.domain/u/{name || 'user'}</Preview>
      </Field>
      <Field name="password">
        <input
          autoComplete="new-password"
          id="password"
          maxLength={PASSWORD_MAX_LENGTH}
          minLength={PASSWORD_MIN_LENGTH}
          name="password"
          onChange={() => setBadPassword('')}
          required
          type="password"
        />
      </Field>
      <Field name="repassword" label="password (again)">
        <input
          autoComplete="new-password"
          className={hasPasswordError ? styles.errorInput : ''}
          id="repassword"
          maxLength={PASSWORD_MAX_LENGTH}
          minLength={PASSWORD_MIN_LENGTH}
          name="repassword"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
        />
        {hasPasswordError ? (
          <ErrorDescription>
            Second password does not match the first. Please ensure that they
            match.
          </ErrorDescription>
        ) : null}
      </Field>
      <button>create</button>
    </AntiCSRFForm>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { auth: token } = ctx.req.cookies

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw 'Environment is missing JWT secret'
    }
    if (token) {
      jwt.verify(token, process.env.JWT_AUTH_SECRET)
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
