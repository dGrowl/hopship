import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'

type Fields = EventTarget &
  CSRFFormFields & {
    consent: HTMLInputElement
  }

const remove = async (
  e: FormEvent,
  platform: string,
  name: string,
  verified: boolean
) => {
  e.preventDefault()
  const { csrf } = e.target as Fields
  await fetch(`/api/identities/${platform}/${name}?verified=${verified}`, {
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
  verified: boolean
}

const RemoveIdentityForm = ({ platform, name, verified }: Props) => {
  const [invalid, setInvalid] = useState(true)
  const csrfCode = useCSRFCode()
  const key = `${platform}//${name}`
  return (
    <section>
      <b>Remove</b>
      <p>
        If you want to remove this identity from your account, type <b>{key}</b>{' '}
        in the field below, then click the delete button.
      </p>
      <form
        onChange={(e) => checkInvalid(e, key, setInvalid)}
        onSubmit={(e) => remove(e, platform, name, verified)}
      >
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <input name="consent" placeholder={key} />
          <button disabled={invalid}>delete</button>
        </fieldset>
      </form>
    </section>
  )
}

export default RemoveIdentityForm
