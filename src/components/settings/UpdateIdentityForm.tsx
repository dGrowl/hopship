import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields, Identity } from '../../lib/types'
import { cleanSpaces, csrfHeaders } from '../../lib/util'
import { DESCRIPTION_MAX_LENGTH, DESCRIPTION_REGEX } from '../../lib/safety'
import AntiCSRFForm from '../AntiCSRFForm'
import Field from '../Field'
import ValidatedTextArea from '../ValidatedTextArea'

type Fields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
  }

const update = async (
  e: FormEvent<HTMLFormElement>,
  network: string,
  name: string
) => {
  e.preventDefault()
  const form = e.target as Fields
  const { csrf, desc } = form
  const data = { desc: cleanSpaces(desc.value) }
  await fetch(`/api/identities/${network}/${name}`, {
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
  const { network, name, desc } = identity
  return (
    <section>
      <h3>Edit</h3>
      <AntiCSRFForm
        onChange={(e) => checkUnchanged(e, setUnchanged)}
        onSubmit={(e) => update(e, network, name)}
      >
        <Field name="description">
          <ValidatedTextArea
            defaultValue={desc}
            id="description"
            maxLength={DESCRIPTION_MAX_LENGTH}
            name="desc"
            pattern={DESCRIPTION_REGEX}
          />
        </Field>
        <button disabled={unchanged}>save</button>
      </AntiCSRFForm>
    </section>
  )
}

export default UpdateIdentityForm
