import { FormEvent, useState } from 'react'

import { jsonHeaders } from '../lib/util'

import styles from '../styles/UpdateUserForm.module.css'
import Field from './Field'

interface Props {
  name: string
  email: string
}

interface Data {
  name?: string
  email?: string
  oldPassword?: string
  newPassword?: string
}

interface Fields extends EventTarget {
  name: HTMLInputElement
  email: HTMLInputElement
  oldPassword: HTMLInputElement
  newPassword: HTMLInputElement
  reNewPassword: HTMLInputElement
}

const updateUser = async (e: FormEvent) => {
  e.preventDefault()
  const { name, email } = e.target as Fields
  const data: Data = {}
  if (name.defaultValue !== name.value) {
    data.name = name.value
  }
  if (email.defaultValue !== email.value) {
    data.email = email.value
  }
  await fetch('/api/users', {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const updatePassword = async (e: FormEvent) => {
  e.preventDefault()
  const { oldPassword, newPassword, reNewPassword } = e.target as Fields
  if (oldPassword.defaultValue !== oldPassword.value) {
    if (newPassword.value !== reNewPassword.value) {
      return
    }
  }
  const data = {
    oldPassword: oldPassword.value,
    newPassword: newPassword.value,
  }
  await fetch('/api/users', {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
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

export const UpdateUserForm = ({ name, email }: Props) => {
  return (
    <form className={styles.userForm} onSubmit={updateUser}>
      <Field name="name">
        <NameInput initial={name} />
      </Field>
      <Field name="email">
        <input name="email" type="email" defaultValue={email} />
      </Field>
      <div className={styles.submitRow}>
        <button className={styles.submitButton}>save</button>
      </div>
    </form>
  )
}

export const UpdatePasswordForm = () => {
  return (
    <form className={styles.passForm} onSubmit={updatePassword}>
      <Field name="old">
        <input name="old" type="password" />
      </Field>
      <Field name="new">
        <input name="new" type="password" />
      </Field>
      <Field name="reNew" label="new (again)">
        <input name="reNew" type="password" />
      </Field>
      <div className={styles.submitRow}>
        <button className={styles.submitButton}>save</button>
      </div>
    </form>
  )
}
