import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { MAX_BIO_LENGTH, useCSRFCode } from '../lib/safety'
import Field from './Field'

import styles from '../styles/UpdateUserForm.module.css'

interface Data {
  name?: string
  email?: string
  bio?: string
}

type Fields = EventTarget &
  CSRFFormFields & {
    name: HTMLInputElement
    email: HTMLInputElement
    bio: HTMLTextAreaElement
  }

const update = async (e: FormEvent, currentName: string) => {
  e.preventDefault()
  const { csrf, name, email, bio } = e.target as Fields
  const data: Data = {}
  if (currentName !== name.value) {
    data.name = name.value
  }
  if (email.defaultValue !== email.value) {
    data.email = email.value
  }
  if (bio.defaultValue !== bio.value) {
    data.bio = bio.value
  }
  if (Object.keys(data).length !== 0) {
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

const checkUnchanged = (
  e: FormEvent<HTMLFormElement>,
  name: string,
  setUnchanged: Dispatch<boolean>
) => {
  const target = e.target as HTMLFormElement
  const fields = target.form as Fields
  setUnchanged(
    name === fields.name.value &&
      fields.email.value === fields.email.defaultValue &&
      fields.bio.value === fields.bio.defaultValue
  )
}

interface Props {
  name: string
  email: string
  bio: string
}

const UpdateUserForm = ({ name, email, bio }: Props) => {
  const [unchanged, setUnchanged] = useState(true)
  const csrfCode = useCSRFCode()
  return (
    <section>
      <form
        onChange={(e) => checkUnchanged(e, name, setUnchanged)}
        onSubmit={(e) => update(e, name)}
      >
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="name">
            <NameInput initial={name} />
          </Field>
          <Field name="email">
            <input name="email" type="email" defaultValue={email} />
          </Field>
          <Field name="bio">
            <textarea
              name="bio"
              maxLength={MAX_BIO_LENGTH}
              defaultValue={bio}
            />
          </Field>
          <button disabled={unchanged}>update</button>
        </fieldset>
      </form>
    </section>
  )
}

export default UpdateUserForm
