import { FormEvent } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'
import Field from './Field'

type Fields = EventTarget &
  CSRFFormFields & {
    current: HTMLInputElement
    future: HTMLInputElement
    reFuture: HTMLInputElement
  }

const update = async (e: FormEvent) => {
  e.preventDefault()
  const { csrf, current, future, reFuture } = e.target as Fields
  if (current.defaultValue !== current.value) {
    if (future.value !== reFuture.value) {
      return
    }
  }
  const data = {
    currentPassword: current.value,
    futurePassword: future.value,
  }
  await fetch('/api/users', {
    method: 'PATCH',
    headers: csrfHeaders(csrf.value),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const UpdatePasswordForm = () => {
  const csrfCode = useCSRFCode()
  return (
    <section>
      <form onSubmit={update}>
        <fieldset>
          <legend>Password</legend>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="current">
            <input name="current" type="password" />
          </Field>
          <Field name="future" label="new">
            <input name="future" type="password" />
          </Field>
          <Field name="reFuture" label="new (again)">
            <input name="reFuture" type="password" />
          </Field>
          <button>change</button>
        </fieldset>
      </form>
    </section>
  )
}

export default UpdatePasswordForm
