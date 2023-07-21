import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields, Identity } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { MAX_DESCRIPTION_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import Field from './Field'

type Fields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
  }

const update = async (
  e: FormEvent<HTMLFormElement>,
  platform: string,
  name: string
) => {
  e.preventDefault()
  const form = e.target as Fields
  const { csrf, desc } = form
  const data = { desc: desc.value }
  await fetch(`/api/identities/${platform}/${name}`, {
    method: 'PATCH',
    headers: csrfHeaders(csrf.value),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const checkUnchanged = (e: FormEvent, setUnchanged: Dispatch<boolean>) => {
  const target = e.target as HTMLFormElement
  const fields = target.form as Fields
  setUnchanged(fields.desc.value === fields.desc.defaultValue)
}

interface Props {
  identity: Identity
}

const UpdateIdentityForm = ({ identity }: Props) => {
  const [unchanged, setUnchanged] = useState(true)
  const { platform, name, desc } = identity
  return (
    <section>
      <h3>Edit</h3>
      <AntiCSRFForm
        onChange={(e) => checkUnchanged(e, setUnchanged)}
        onSubmit={(e) => update(e, platform, name)}
      >
        <Field name="description">
          <textarea
            defaultValue={desc}
            id="description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            name="desc"
          />
        </Field>
        <button disabled={unchanged}>save</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateIdentityForm
