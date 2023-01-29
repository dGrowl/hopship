import { FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'
import Field from './Field'

import styles from '../styles/UpdateUserForm.module.css'

interface Data {
  name?: string
  email?: string
}

type Fields = EventTarget &
  CSRFFormFields & {
    name: HTMLInputElement
    email: HTMLInputElement
  }

const update = async (e: FormEvent, currentName: string) => {
  e.preventDefault()
  const { csrf, name, email } = e.target as Fields
  const data: Data = {}
  if (currentName !== name.value) {
    data.name = name.value
  }
  if (email.defaultValue !== email.value) {
    data.email = email.value
  }
  if (data.name || data.email) {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: csrfHeaders(csrf.value),
      body: JSON.stringify(data),
    })
    window.location.reload()
  }
}

interface NameInputProps {
  initial: string
}

const NameInput = ({ initial }: NameInputProps) => {
  const [name, setName] = useState(initial)
  return (
    <>
      <input
        name="name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <div className={styles.nameResult}>⮩ also.domain/u/{name}</div>
    </>
  )
}

interface Props {
  name: string
  email: string
}

const UpdateUserForm = ({ name, email }: Props) => {
  const csrfCode = useCSRFCode()
  return (
    <section>
      <form onSubmit={(e) => update(e, name)}>
        <fieldset>
          <legend>User</legend>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="name">
            <NameInput initial={name} />
          </Field>
          <Field name="email">
            <input name="email" type="email" defaultValue={email} />
          </Field>
          <button>update</button>
        </fieldset>
      </form>
    </section>
  )
}

export default UpdateUserForm
