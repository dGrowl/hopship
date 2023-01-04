import { FormEvent, MouseEvent } from 'react'

import { Identity } from '../lib/types'
import { jsonHeaders } from '../lib/util'
import PlatformSelector from './PlatformSelector'

import styles from '../styles/IdentitiesList.module.css'

type AddFormFields = EventTarget & {
  platform: HTMLSelectElement
  name: HTMLInputElement
  desc: HTMLTextAreaElement
}

type EditFormFields = EventTarget & {
  desc: HTMLTextAreaElement
}

interface Props {
  editable?: boolean
  identities: Identity[]
}

const add = async (e: FormEvent) => {
  e.preventDefault()
  const form = e.target as AddFormFields
  const platform = form.platform.value
  const name = form.name.value
  const desc = form.desc.value
  const data = { platform, name, desc }
  await fetch('/api/identities', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const removeIdentity = async (
  e: MouseEvent,
  platform: string,
  name: string
) => {
  e.preventDefault()
  const data = { platform, name }
  await fetch('/api/identities', {
    method: 'DELETE',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const saveDescription = async (
  e: FormEvent,
  platform: string,
  name: string
) => {
  e.preventDefault()
  const form = e.target as EditFormFields
  const { desc } = form
  if (desc.defaultValue !== desc.value) {
    const data = { platform, name, desc: desc.value }
    await fetch('/api/identities', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
  }
  window.location.reload()
}

const buildRows = (identities: Identity[], editable: boolean) => {
  return identities.map(({ platform, name, desc, verified }) => (
    <form
      key={platform + name}
      onSubmit={(e) => saveDescription(e, platform, name)}
    >
      <div className={`${styles.row} ${styles[platform]}`}>
        {editable ? <div>{verified ? 'yes' : 'no'}</div> : null}
        <div>{platform}</div>
        <div>{name}</div>
        <div>
          {editable ? (
            <textarea name="desc" className={styles.desc} defaultValue={desc} />
          ) : (
            <>{desc}</>
          )}
        </div>
        {editable ? (
          <div>
            {verified ? null : <button>Verify</button>}
            <button>Update</button>
            <button onClick={(e) => removeIdentity(e, platform, name)}>
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </form>
  ))
}

const AddRow = () => (
  <form onSubmit={add}>
    <div className={`${styles.row} ${styles.footerRow}`}>
      <div>no</div>
      <div>
        <PlatformSelector initial={null} />
      </div>
      <div>
        <input name="name" />
      </div>
      <div>
        <textarea name="desc" className={styles.desc} />
      </div>
      <div>
        <button>Add</button>
      </div>
    </div>
  </form>
)

const IdentitiesList = ({ identities, editable }: Props) => {
  editable = editable || false
  return (
    <div
      id={styles.identities}
      style={editable ? { gridTemplateColumns: 'repeat(5, auto)' } : {}}
    >
      <div className={`${styles.row} ${styles.headerRow}`}>
        {editable ? <div>Verified</div> : null}
        <div>Platform</div>
        <div>ID</div>
        <div>Description</div>
        {editable ? <div>Edit</div> : null}
      </div>
      {buildRows(identities, editable)}
      {editable ? <AddRow /> : null}
    </div>
  )
}

export default IdentitiesList
