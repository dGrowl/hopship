'use client'

import { Dispatch, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AppRouter, CSRFFormFields, Identity } from 'lib/types'
import { DECENTRALIZED_NETWORKS, csrfHeaders } from 'lib/util'
import { invalidatePath } from 'lib/actions'
import AntiCSRFForm from 'components/AntiCSRFForm'

type Fields = EventTarget &
  CSRFFormFields & {
    consent: HTMLInputElement
  }

const remove = async (e: FormEvent, router: AppRouter, identity: Identity) => {
  e.preventDefault()
  const { csrf } = e.target as Fields
  const { network, name } = identity
  const res = await fetch(`/api/identities/${network}/${name}`, {
    method: 'DELETE',
    headers: csrfHeaders(csrf.value),
  })
  if (res.status === 200) {
    await invalidatePath('/settings/identities')
    router.push('/settings/identities')
  } else {
    router.refresh()
  }
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
  identity: Identity
}

const RemoveIdentityForm = ({ identity }: Props) => {
  const [invalid, setInvalid] = useState(true)
  const { platform, network, name } = identity
  const router = useRouter()
  const key = DECENTRALIZED_NETWORKS.includes(network)
    ? `${network}/${name}`
    : `${platform}/${name}`
  return (
    <section>
      <h3>Remove</h3>
      <p>
        If you want to remove this identity from your account, type <b>{key}</b>{' '}
        in the field below, then click the delete button.
      </p>
      <AntiCSRFForm
        onChange={(e) => checkInvalid(e, key, setInvalid)}
        onSubmit={(e) => remove(e, router, identity)}
      >
        <input name="consent" placeholder={key} />
        <button disabled={invalid}>delete</button>
      </AntiCSRFForm>
    </section>
  )
}

export default RemoveIdentityForm
