import { FormEvent } from 'react'

import { jsonHeaders } from '../lib/util'
import PlatformSelector from './PlatformSelector'

interface AddIdentityFormProps {
  user_name: string
}

interface AddIdentityFormFields extends EventTarget {
  platform: HTMLInputElement
  name: HTMLInputElement
  desc: HTMLInputElement
}

const submit = async (e: FormEvent, user_name: string) => {
  e.preventDefault()
  const fields = e.target as AddIdentityFormFields
  const platform = fields.platform.value
  const platform_name = fields.name.value
  const desc = fields.desc.value
  const data = { user_name, platform, platform_name, desc }
  await fetch('/api/identities', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const AddIdentityForm = ({ user_name }: AddIdentityFormProps) => {
  return (
    <form onSubmit={(e) => submit(e, user_name)}>
      <label htmlFor="platform">Platform</label>
      <PlatformSelector initial={null} />
      <label htmlFor="name">ID</label>
      <input name="name" />
      <label htmlFor="desc">Description</label>
      <textarea name="desc" maxLength={256}></textarea>
      <button>Submit</button>
    </form>
  )
}

export default AddIdentityForm
