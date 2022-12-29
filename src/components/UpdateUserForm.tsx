import { FormEvent } from 'react'

import { jsonHeaders } from '../lib/util'

import styles from '../styles/UpdateUserForm.module.css'

interface Props {
  name: string
  email: string
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
  const { name } = e.target as Fields
  if (name.defaultValue !== name.value) {
    const data = { name: name.value }
    await fetch('/api/users', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    window.location.reload()
  }
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
