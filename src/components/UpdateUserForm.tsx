import { Dispatch, FormEvent, useReducer, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders, objectReducer } from '../lib/util'
import {
  BIO_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_REGEX,
} from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import FallibleInput from './FallibleInput'
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

const update = async (
  e: FormEvent,
  currentName: string,
  setBadValues: Dispatch<object>
) => {
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
    const response = await fetch(`/api/users/${currentName}`, {
      method: 'PATCH',
      headers: csrfHeaders(csrf.value),
      body: JSON.stringify(data),
    })
    if (response.status !== 200) {
      const body = await response.json()
      if (body.error === 'DUPLICATE_NAME') {
        return setBadValues({ name: name.value })
      }
      if (body.error === 'DUPLICATE_EMAIL') {
        return setBadValues({ email: email.value })
      }
    } else {
      window.location.reload()
    }
  }
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

interface FallibleValues {
  email: string
  name: string
}

interface Props extends FallibleValues {
  bio: string
}

const UpdateUserForm = ({ name, email, bio }: Props) => {
  const [badValues, setBadValues] = useReducer(objectReducer<FallibleValues>, {
    email: '',
    name: '',
  })
  const [unchanged, setUnchanged] = useState(true)
  const [userName, setUserName] = useState(name)
  return (
    <section>
      <AntiCSRFForm
        onChange={(e) => checkUnchanged(e, name, setUnchanged)}
        onSubmit={(e) => update(e, name, setBadValues)}
      >
        <Field name="name">
          <FallibleInput
            autoComplete="username"
            badValue={badValues.name}
            defaultValue={name}
            id="name"
            maxLength={USER_NAME_MAX_LENGTH}
            minLength={USER_NAME_MIN_LENGTH}
            name="name"
            onChange={(e) => setUserName(e.target.value)}
            pattern={USER_NAME_REGEX}
            placeholder="user"
            required
            title="Usernames can only contain letters, numbers, and underscores."
          >
            Name is already in use. Please choose a different one.
          </FallibleInput>
          <Preview>also.domain/u/{userName || 'user'}</Preview>
        </Field>
        <Field name="email">
          <FallibleInput
            autoComplete="email"
            badValue={badValues.email}
            defaultValue={email}
            id="email"
            maxLength={EMAIL_MAX_LENGTH}
            minLength={EMAIL_MIN_LENGTH}
            name="email"
            pattern={EMAIL_REGEX}
            placeholder="user@e.mail"
            type="email"
          >
            Email is already in use. Please enter a different one.
          </FallibleInput>
        </Field>
        <Field name="bio">
          <textarea
            defaultValue={bio}
            id="bio"
            maxLength={BIO_MAX_LENGTH}
            name="bio"
            placeholder="A brief description of you who are."
          />
        </Field>
        <button disabled={unchanged}>update</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateUserForm
