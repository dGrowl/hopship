import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { MAX_BIO_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
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
    await fetch(`/api/users/${currentName}`, {
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
        id="name"
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
  return (
    <section>
      <AntiCSRFForm
        onChange={(e) => checkUnchanged(e, name, setUnchanged)}
        onSubmit={(e) => update(e, name)}
      >
        <Field name="name">
          <NameInput initial={name} />
        </Field>
        <Field name="email">
          <input defaultValue={email} id="email" name="email" type="email" />
        </Field>
        <Field name="bio">
          <textarea
            defaultValue={bio}
            id="bio"
            maxLength={MAX_BIO_LENGTH}
            name="bio"
          />
        </Field>
        <button disabled={unchanged}>update</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateUserForm
