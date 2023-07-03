import { FormEvent, useState } from 'react'
import Link from 'next/link'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders, platforms } from '../lib/util'
import { MAX_DESCRIPTION_LENGTH, MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'

import styles from '../styles/IdentityBox.module.css'

type AddFields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
    name: HTMLInputElement
    platform: HTMLSelectElement
  }

const add = async (e: FormEvent) => {
  e.preventDefault()
  const form = e.target as AddFields
  const csrf = form.csrf.value
  const desc = form.desc.value
  const name = form.name.value
  const platform = form.platform.value
  const data = { platform, name, desc }
  await fetch('/api/identities', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

interface AddProps {
  close: () => void
}

export const AddIdentityBox = ({ close }: AddProps) => {
  const [platform, setPlatform] = useState(platforms[0])
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <AntiCSRFForm onSubmit={add}>
        <div className={`${styles.platform} ${styles[platform]}`}>
          <select
            id={styles.addSelector}
            name="platform"
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option>Twitch</option>
            <option>Twitter</option>
          </select>
        </div>
        <div className={styles.details}>
          <input
            maxLength={MAX_PLATFORM_NAME_LENGTH}
            minLength={1}
            name="name"
            pattern="\w+"
            placeholder={`${platform} name`}
            required
            title="Platform IDs can only contain letters, numbers, and underscores."
          />
          <textarea
            maxLength={MAX_DESCRIPTION_LENGTH}
            name="desc"
            placeholder="(optional) A description of what you use this account for."
          />
          <button>add</button>
        </div>
      </AntiCSRFForm>
      <div className={styles.buttonColumn}>
        <button onClick={close}>X</button>
      </div>
    </div>
  )
}

interface Props {
  platform: string
  name: string
  desc: string
  status: string
  editable?: boolean
}

const IdentityBox = ({ platform, name, desc, status, editable }: Props) => {
  const settingsURL = `/settings/${platform}/${name}`
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <div className={`${styles.platform} ${styles[platform]}`}>{platform}</div>
      <div className={styles.details}>
        <div className={styles.nameRow}>
          <h3>{name}</h3>
          {status !== 'VERIFIED' ? (
            <Link href={settingsURL}>
              <div className={styles.unverified}>UNVERIFIED</div>
            </Link>
          ) : null}
        </div>
        {desc.length > 0 ? <div>{desc}</div> : null}
      </div>
      {editable ? (
        <div className={styles.buttonColumn}>
          <Link href={settingsURL}>
            <button>C</button>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default IdentityBox
