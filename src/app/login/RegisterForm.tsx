import { Dispatch, FormEvent, useReducer, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { AppRouter } from '../../lib/types'
import { csrfHeaders, objectReducer } from '../../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_REGEX,
} from '../../lib/safety'
import { HOME_DOMAIN } from '../../lib/env'
import AntiCSRFForm from '../../components/AntiCSRFForm'
import FallibleInput from '../../components/FallibleInput'
import Field from '../../components/Field'
import PasswordInput from '../../components/PasswordInput'
import Preview from '../../components/Preview'

interface RegisterFormFields extends EventTarget {
  csrf: HTMLInputElement
  email: HTMLInputElement
  name: HTMLInputElement
  password: HTMLInputElement
  repassword: HTMLInputElement
}

const register = async (
  e: FormEvent,
  router: AppRouter,
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
  if (response.status !== 201) {
    const body = await response.json()
    if (body.error === 'PG_DUPLICATE_EMAIL') {
      return setBadValues({ email })
    }
    if (body.error === 'PG_DUPLICATE_USER_NAME') {
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
    router.refresh()
  }
}

interface RegistrationFallibleValues {
  email: string
  name: string
  password: string
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
        <Preview>
          {HOME_DOMAIN}/u/{name || 'user'}
        </Preview>
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
      <p>
        By registering, you agree to the terms laid out in our{' '}
        <Link href="/about/privacy" className="underline" target="_blank">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/about/terms" className="underline" target="_blank">
          Terms of Service
        </Link>
        .
      </p>
      <button>create</button>
    </AntiCSRFForm>
  )
}

export default RegisterForm
