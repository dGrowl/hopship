import { Dispatch, FormEvent, useReducer } from 'react'
import { useRouter } from 'next/navigation'

import { AppRouter } from '../../lib/types'
import { csrfHeaders, objectReducer } from '../../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
} from '../../lib/safety'
import AntiCSRFForm from '../../components/AntiCSRFForm'
import FallibleInput from '../../components/FallibleInput'
import Field from '../../components/Field'
import PasswordInput from '../../components/PasswordInput'

interface LoginFormFields extends EventTarget {
  csrf: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
}

const login = async (
  e: FormEvent,
  router: AppRouter,
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

export default LoginForm
