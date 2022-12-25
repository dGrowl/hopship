import { FormEvent, MouseEvent, useState } from 'react'

import { Identity } from '../lib/types'
import { jsonHeaders } from '../lib/util'

type IdentitiesListFormFields = EventTarget & {
  [key: string]: HTMLFormElement
}

interface IdentitiesListProps {
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

const buildRows = (identities: Identity[], editable: boolean) => {
  return identities.map(({ platform, name, desc }) => (
    <tr key={platform + name}>
      <td>{platform}</td>
      <td>{name}</td>
      <td>
        {editable ? (
          <textarea defaultValue={desc} name={`${platform}/${name}`} />
        ) : (
          <>{desc}</>
        )}
      </td>
      {editable ? (
        <td>
          <button onClick={(e) => removeIdentity(e, platform, name)}>X</button>
        </td>
      ) : null}
    </tr>
  ))
}

const saveDescriptions = async (e: FormEvent, changedDescs: string[]) => {
  e.preventDefault()
  const responses = []
  for (const name of changedDescs) {
    const form = e.target as IdentitiesListFormFields
    const textarea = form[name]
    if (textarea) {
      const desc = textarea.value
      const [platform, name] = textarea.name.split('/')
      const data = { platform, name, desc }
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

export default function IdentitiesList(props: IdentitiesListProps) {
  const [changedDescs, setChangedDescs] = useState<string[]>([])
  const { identities } = props
  const editable = props.editable || false
  const updateChangedDescs = (e: FormEvent) => {
    const descField = e.target as HTMLTextAreaElement
    if (descField.value === descField.defaultValue) {
      setChangedDescs((descs) =>
        descs.filter((name) => name !== descField.name)
      )
    } else {
      setChangedDescs((descs) =>
        descs.includes(descField.name) ? descs : [...descs, descField.name]
      )
    }
  }
  return (
    <form
      onSubmit={(e) => saveDescriptions(e, changedDescs)}
      onChange={updateChangedDescs}
    >
      <table>
        <thead>
          <tr>
            <td>Platform</td>
            <td>ID</td>
            <td>Description</td>
            {editable ? <td>Delete?</td> : null}
          </tr>
        </thead>
        <tbody>
          {buildRows(identities, editable)}
          {editable ? (
            <tr>
              <td></td>
              <td></td>
              <td>
                <button>Save Changes</button>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </form>
  )
}
