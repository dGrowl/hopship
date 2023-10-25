'use client'

import { FormEvent, useState } from 'react'

import { CSRFFormFields } from '../../../lib/types'
import { csrfHeaders } from '../../../lib/util'
import AntiCSRFForm from '../../../components/AntiCSRFForm'

type Fields = EventTarget &
  CSRFFormFields & {
    name: HTMLInputElement
  }

const submit = async (e: FormEvent) => {
  e.preventDefault()
  const { csrf, name } = e.target as Fields
  await fetch(`/api/users/${name.value}`, {
    method: 'DELETE',
    headers: csrfHeaders(csrf.value),
  })
  window.location.reload()
}

interface Props {
  name: string
}

const RemoveUserForm = ({ name }: Props) => {
  const [invalid, setInvalid] = useState(true)
  return (
    <section>
      <p>
        WARNING: Account deletion is forever. We don&apos;t keep backups of your
        data. <strong>Everything will be gone.</strong>
      </p>
      <p>
        If you want to delete your account, enter your username below, then hit
        delete.
      </p>
      <AntiCSRFForm onSubmit={submit}>
        <input
          name="name"
          onChange={(e) => setInvalid(e.target.value !== name)}
          placeholder={name}
        />
        <button disabled={invalid}>delete</button>
      </AntiCSRFForm>
    </section>
  )
}

export default RemoveUserForm
