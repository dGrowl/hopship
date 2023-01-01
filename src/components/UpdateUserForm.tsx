import { FormEvent } from 'react'

import { jsonHeaders } from '../lib/util'

import styles from '../styles/UpdateUserForm.module.css'

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

const submit = async (e: FormEvent) => {
  e.preventDefault()
  const { name, email, oldPassword, newPassword, reNewPassword } =
    e.target as Fields
  const data: Data = {}
  if (name.defaultValue !== name.value) {
    data.name = name.value
  }
  if (email.defaultValue !== email.value) {
    data.email = email.value
  }
  if (oldPassword.defaultValue !== oldPassword.value) {
    if (newPassword.value !== reNewPassword.value) {
      return
    }
    data.oldPassword = oldPassword.value
    data.newPassword = newPassword.value
  }
  await fetch('/api/users', {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const UpdateUserForm = ({ name, email }: Props) => {
  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="name">Name</label>
      <div>
        <input name="name" defaultValue={name} />
        <div>https://also.domain/u/{name}</div>
      </div>
      <label htmlFor="email">Email</label>
      <input name="email" type="email" defaultValue={email} />
      <label htmlFor="oldPassword">Password</label>
      <div className={styles.passwordFields}>
        <label htmlFor="oldPassword">Old</label>
        <input name="oldPassword" type="password" />
        <label htmlFor="newPassword">New</label>
        <input name="newPassword" type="password" />
        <label htmlFor="reNewPassword">New (again)</label>
        <input name="reNewPassword" type="password" />
      </div>
      <button>Update</button>
    </form>
  )
}

export default UpdateUserForm
