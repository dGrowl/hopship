import { FormEvent, useState } from 'react'
import Link from 'next/link'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders, platforms } from '../lib/util'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PLATFORM_NAME_LENGTH,
  useCSRFCode,
} from '../lib/safety'

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
  const csrfCode = useCSRFCode()
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <form onSubmit={add}>
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
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
              name="name"
              placeholder={`${platform} name`}
              pattern="\w+"
              minLength={1}
              maxLength={MAX_PLATFORM_NAME_LENGTH}
              title="Platform IDs can only contain letters, numbers, and underscores."
              required
            />
            <textarea
              name="desc"
              placeholder="(optional) A description of what you use this account for."
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <button>add</button>
          </div>
        </fieldset>
      </form>
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
  verified?: boolean
  editable?: boolean
}

const IdentityBox = ({ platform, name, desc, verified, editable }: Props) => {
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <div className={`${styles.platform} ${styles[platform]}`}>{platform}</div>
      <div className={styles.details}>
        <div className={styles.nameRow}>
          <h3>{name}</h3>
          {verified === false ? (
            <div className={styles.unverified}>UNVERIFIED</div>
          ) : null}
        </div>
        {desc.length > 0 ? <div>{desc}</div> : null}
      </div>
      {editable ? (
        <div className={styles.buttonColumn}>
          <button>C</button>
        </div>
      ) : null}
    </div>
  )
}

export default IdentityBox
