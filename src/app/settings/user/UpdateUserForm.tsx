'use client'

import { Dispatch, FormEvent, useReducer, useState } from 'react'

import { cleanSpaces, csrfHeaders, objectReducer } from 'lib/util'
import { CSRFFormFields } from 'lib/types'
import {
  BIO_MAX_LENGTH,
  BIO_REGEX,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_REGEX,
} from 'lib/safety'
import { HOME_DOMAIN } from 'lib/env'
import AntiCSRFForm from 'components/AntiCSRFForm'
import FallibleInput from 'components/FallibleInput'
import Field from 'components/Field'
import Preview from 'components/Preview'
import ValidatedTextArea from 'components/ValidatedTextArea'

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
  user: Props,
  setBadValues: Dispatch<object>
) => {
  e.preventDefault()
  const { csrf, name, email, bio } = e.target as Fields
  const data: Data = {}
  if (user.name !== name.value) {
    data.name = name.value
  }
  if (user.email !== email.value) {
    data.email = email.value
  }
  if (user.bio !== bio.value) {
    data.bio = cleanSpaces(bio.value)
  }
  if (Object.keys(data).length !== 0) {
    const response = await fetch(`/api/users/${user.name}`, {
      method: 'PATCH',
      headers: csrfHeaders(csrf.value),
      body: JSON.stringify(data),
    })
    if (response.status !== 200) {
      const body = await response.json()
      if (body.error === 'PG_DUPLICATE_USER_NAME') {
        return setBadValues({ name: name.value })
      }
      if (body.error === 'PG_DUPLICATE_EMAIL') {
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

const UpdateUserForm = (user: Props) => {
  const { name, email, bio } = user
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
        onSubmit={(e) => update(e, user, setBadValues)}
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
          <Preview>
            {HOME_DOMAIN}/u/{userName || 'user'}
          </Preview>
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
          <ValidatedTextArea
            defaultValue={bio}
            id="bio"
            maxLength={BIO_MAX_LENGTH}
            name="bio"
            pattern={BIO_REGEX}
            placeholder="A brief description of you who are."
          />
        </Field>
        <button disabled={unchanged}>update</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateUserForm
