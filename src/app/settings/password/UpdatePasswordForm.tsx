'use client'

import { Dispatch, FormEvent, useReducer } from 'react'

import { CSRFFormFields } from '../../../lib/types'
import { csrfHeaders, objectReducer } from '../../../lib/util'
import AntiCSRFForm from '../../../components/AntiCSRFForm'
import Field from '../../../components/Field'
import PasswordInput from '../../../components/PasswordInput'

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
          <PasswordInput
            autoComplete="current-password"
            badValue={badValues.current}
            id="current"
            name="current"
          >
            This doesn&apos;t match your current password. Please enter the
            correct password.
          </PasswordInput>
        </Field>
        <Field name="future" label="new">
          <PasswordInput
            autoComplete="new-password"
            id="future"
            name="future"
            onChange={() => setBadValues({ reFuture: '' })}
          />
        </Field>
        <Field name="reFuture" label="new (again)">
          <PasswordInput
            autoComplete="new-password"
            badValue={badValues.reFuture}
            id="reFuture"
            name="reFuture"
          >
            Second password doesn&apos;t match the first. Please ensure that
            they match.
          </PasswordInput>
        </Field>
        <button>change</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdatePasswordForm
