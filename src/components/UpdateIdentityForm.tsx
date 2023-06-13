import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { MAX_DESCRIPTION_LENGTH, useCSRFCode } from '../lib/safety'
import Field from './Field'

type Fields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
  }

const update = async (
  e: FormEvent<HTMLFormElement>,
  platform: string,
  name: string,
  verified: boolean
) => {
  e.preventDefault()
  const form = e.target as Fields
  const { csrf, desc } = form
  const data = { platform, name, desc: desc.value, verified }
  await fetch('/api/identities', {
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
  platform: string
  name: string
  desc: string
  verified: boolean
}

const UpdateIdentityForm = ({ platform, name, desc, verified }: Props) => {
  const [unchanged, setUnchanged] = useState(true)
  const csrfCode = useCSRFCode()
  return (
    <section>
      <form
        onChange={(e) => checkUnchanged(e, setUnchanged)}
        onSubmit={(e) => update(e, platform, name, verified)}
      >
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          <Field name="description">
            <textarea
              name="desc"
              defaultValue={desc}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
          </Field>
          <button disabled={unchanged}>save</button>
        </fieldset>
      </form>
    </section>
  )
}

export default UpdateIdentityForm
