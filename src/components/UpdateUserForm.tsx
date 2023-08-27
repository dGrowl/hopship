import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import {
  BIO_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
} from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import Field from './Field'
import Preview from './Preview'

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
        maxLength={USER_NAME_MAX_LENGTH}
        minLength={USER_NAME_MIN_LENGTH}
        name="name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <Preview>also.domain/u/{name}</Preview>
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
          <input
            defaultValue={email}
            id="email"
            maxLength={EMAIL_MAX_LENGTH}
            minLength={EMAIL_MIN_LENGTH}
            name="email"
            pattern={EMAIL_REGEX}
            type="email"
          />
        </Field>
        <Field name="bio">
          <textarea
            defaultValue={bio}
            id="bio"
            maxLength={BIO_MAX_LENGTH}
            name="bio"
          />
        </Field>
        <button disabled={unchanged}>update</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateUserForm
