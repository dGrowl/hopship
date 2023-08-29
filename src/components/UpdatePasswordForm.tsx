import { Dispatch, FormEvent, useReducer } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders, objectReducer } from '../lib/util'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import FallibleInput from './FallibleInput'
import Field from './Field'

type Fields = EventTarget &
  CSRFFormFields & {
    current: HTMLInputElement
    future: HTMLInputElement
    reFuture: HTMLInputElement
  }

const update = async (
  e: FormEvent,
  name: string,
  setBadValues: Dispatch<object>
) => {
  e.preventDefault()
  const { csrf, current, future, reFuture } = e.target as Fields
  if (future.value !== reFuture.value) {
    return setBadValues({ reFuture: reFuture.value })
  }
  const data = {
    currentPassword: current.value,
    futurePassword: future.value,
  }
  const response = await fetch(`/api/users/${name}`, {
    method: 'PATCH',
    headers: csrfHeaders(csrf.value),
    body: JSON.stringify(data),
  })
  if (response.status !== 200) {
    const body = await response.json()
    if (body.error === 'WRONG_PASSWORD') {
      return setBadValues({ current: current.value })
    }
  } else {
    window.location.reload()
  }
}

interface FallibleValues {
  current: string
  reFuture: string
}

interface Props {
  name: string
}

const UpdatePasswordForm = ({ name }: Props) => {
  const [badValues, setBadValues] = useReducer(objectReducer<FallibleValues>, {
    current: '',
    reFuture: '',
  })
  return (
    <section>
      <AntiCSRFForm onSubmit={(e) => update(e, name, setBadValues)}>
        <Field name="current">
          <FallibleInput
            autoComplete="password"
            badValue={badValues.current}
            id="current"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="current"
            required
            type="password"
          >
            This doesn't match your current password. Please enter the correct
            password.
          </FallibleInput>
        </Field>
        <Field name="future" label="new">
          <input
            autoComplete="new-password"
            id="future"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="future"
            onChange={() => setBadValues({ reFuture: '' })}
            required
            type="password"
          />
        </Field>
        <Field name="reFuture" label="new (again)">
          <FallibleInput
            autoComplete="new-password"
            badValue={badValues.reFuture}
            id="reFuture"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="reFuture"
            required
            type="password"
          >
            Second password doesn't match the first. Please ensure that they
            match.
          </FallibleInput>
        </Field>
        <button>change</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdatePasswordForm
