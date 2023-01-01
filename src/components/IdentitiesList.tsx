import { FormEvent, MouseEvent, useState } from 'react'

import { Identity } from '../lib/types'
import { jsonHeaders } from '../lib/util'

import styles from '../styles/IdentitiesList.module.css'

type FormFields = EventTarget & {
  [key: string]: HTMLFormElement
}

interface Props {
  editable?: boolean
  identities: Identity[]
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

const saveDescriptions = async (e: FormEvent) => {
  e.preventDefault()
  const form = e.target as FormFields
  const descs = Array.from(form.elements).filter(
    (e: Element) => e.tagName === 'TEXTAREA'
  ) as HTMLTextAreaElement[]
  const responses = []
  for (const desc of descs) {
    if (desc.defaultValue !== desc.value) {
      const [platform, name] = desc.name.split('/')
      const data = { platform, name, desc: desc.value }
      responses.push(
        fetch('/api/identities', {
          method: 'PATCH',
          headers: jsonHeaders,
          body: JSON.stringify(data),
        })
      )
    }
  }
  await Promise.all(responses)
  window.location.reload()
}

const buildRows = (identities: Identity[], editable: boolean) => {
  return identities.map(({ platform, name, desc }) => (
    <div key={platform + name} className={`${styles.row} ${styles[platform]}`}>
      <div>{platform}</div>
      <div>{name}</div>
      <div>
        {editable ? (
          <textarea
            className={styles.desc}
            defaultValue={desc}
            name={`${platform}/${name}`}
          />
        ) : (
          <>{desc}</>
        )}
      </div>
      {editable ? (
        <div>
          <button onClick={(e) => removeIdentity(e, platform, name)}>X</button>
        </div>
      ) : null}
    </div>
  ))
}

export default function IdentitiesList({ identities, editable }: Props) {
  editable = editable || false
  return (
    <form onSubmit={saveDescriptions}>
      <div
        id={styles.identities}
        style={editable ? { gridTemplateColumns: 'repeat(4, auto)' } : {}}
      >
        <div className={`${styles.row} ${styles.headerRow}`}>
          <div>Platform</div>
          <div>ID</div>
          <div>Description</div>
          {editable ? <div>Delete?</div> : null}
        </div>
        {buildRows(identities, editable)}
        {editable ? (
          <div className={styles.row}>
            <div></div>
            <div></div>
            <div>
              <button>Save Descriptions</button>
            </div>
            <div></div>
          </div>
        ) : null}
      </div>
    </form>
  )
}
