import { FormEvent } from 'react'

import { jsonHeaders } from '../lib/util'
import PlatformSelector from './PlatformSelector'

interface AddIdentityFormFields extends EventTarget {
  platform: HTMLInputElement
  name: HTMLInputElement
  desc: HTMLInputElement
}

const createIdentity = async (e: FormEvent) => {
  e.preventDefault()
  const fields = e.target as AddIdentityFormFields
  const platform = fields.platform.value
  const name = fields.name.value
  const desc = fields.desc.value
  const data = { platform, name, desc }
  await fetch('/api/identities', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const AddIdentityForm = () => {
  return (
    <form onSubmit={createIdentity}>
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
