import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import AntiCSRFForm from './AntiCSRFForm'

type Fields = EventTarget &
  CSRFFormFields & {
    consent: HTMLInputElement
  }

const remove = async (e: FormEvent, platform: string, name: string) => {
  e.preventDefault()
  const { csrf } = e.target as Fields
  await fetch(`/api/identities/${platform}/${name}`, {
    method: 'DELETE',
    headers: csrfHeaders(csrf.value),
  })
  window.location.reload()
}

const checkInvalid = (
  e: FormEvent,
  key: string,
  setInvalid: Dispatch<boolean>
) => {
  const target = e.target as HTMLFormElement
  const fields = target.form as Fields
  setInvalid(key !== fields.consent.value)
}

interface Props {
  platform: string
  name: string
}

const RemoveIdentityForm = ({ platform, name }: Props) => {
  const [invalid, setInvalid] = useState(true)
  const key = `${platform}//${name}`
  return (
    <section>
      <b>Remove</b>
      <p>
        If you want to remove this identity from your account, type <b>{key}</b>{' '}
        in the field below, then click the delete button.
      </p>
      <AntiCSRFForm
        onChange={(e) => checkInvalid(e, key, setInvalid)}
        onSubmit={(e) => remove(e, platform, name)}
      >
        <input name="consent" placeholder={key} />
        <button disabled={invalid}>delete</button>
      </AntiCSRFForm>
    </section>
  )
}

export default RemoveIdentityForm
