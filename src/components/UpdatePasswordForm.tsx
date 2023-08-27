import { FormEvent } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import Field from './Field'

type Fields = EventTarget &
  CSRFFormFields & {
    current: HTMLInputElement
    future: HTMLInputElement
    reFuture: HTMLInputElement
  }

const update = async (e: FormEvent, name: string) => {
  e.preventDefault()
  const { csrf, current, future, reFuture } = e.target as Fields
  if (future.value !== reFuture.value) {
    return
  }
  const data = {
    currentPassword: current.value,
    futurePassword: future.value,
  }
  await fetch(`/api/users/${name}`, {
    method: 'PATCH',
    headers: csrfHeaders(csrf.value),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

interface Props {
  name: string
}

const UpdatePasswordForm = ({ name }: Props) => {
  return (
    <section>
      <AntiCSRFForm onSubmit={(e) => update(e, name)}>
        <Field name="current">
          <input
            id="current"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="current"
            required
            type="password"
          />
        </Field>
        <Field name="future" label="new">
          <input
            id="future"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="future"
            required
            type="password"
          />
        </Field>
        <Field name="reFuture" label="new (again)">
          <input
            id="reFuture"
            maxLength={PASSWORD_MAX_LENGTH}
            minLength={PASSWORD_MIN_LENGTH}
            name="reFuture"
            required
            type="password"
          />
        </Field>
        <button>change</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdatePasswordForm
