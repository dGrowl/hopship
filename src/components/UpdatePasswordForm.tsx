import { FormEvent } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  useCSRFCode,
} from '../lib/safety'
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
  const csrfCode = useCSRFCode()
  return (
    <section>
      <form onSubmit={(e) => update(e, name)}>
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="current">
            <input
              id="current"
              maxLength={MAX_PASSWORD_LENGTH}
              minLength={MIN_PASSWORD_LENGTH}
              name="current"
              required
              type="password"
            />
          </Field>
          <Field name="future" label="new">
            <input
              id="future"
              maxLength={MAX_PASSWORD_LENGTH}
              minLength={MIN_PASSWORD_LENGTH}
              name="future"
              required
              type="password"
            />
          </Field>
          <Field name="reFuture" label="new (again)">
            <input
              id="reFuture"
              maxLength={MAX_PASSWORD_LENGTH}
              minLength={MIN_PASSWORD_LENGTH}
              name="reFuture"
              required
              type="password"
            />
          </Field>
          <button>change</button>
        </fieldset>
      </form>
    </section>
  )
}

export default UpdatePasswordForm
