import {
  BsGearFill,
  BsQuestionCircle,
  BsTwitch,
  BsTwitter,
  BsXLg,
} from 'react-icons/bs'
import { FormEvent, useState } from 'react'
import Link from 'next/link'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders, platforms } from '../lib/util'
import { MAX_DESCRIPTION_LENGTH, MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'

import styles from '../styles/IdentityBox.module.css'

interface PlatformBadgeProps {
  editable: boolean
  platform: string
}

const PlatformBadge = ({ editable, platform }: PlatformBadgeProps) => {
  const size = editable ? 36 : 44
  switch (platform) {
    case 'Twitter':
      return <BsTwitter size={size} />
    case 'Twitch':
      return <BsTwitch size={size} />
  }
  return <BsQuestionCircle size={size} />
}

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
          <PlatformBadge editable={true} platform={platform} />
          <select
            id={styles.addSelector}
            name="platform"
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option>Twitch</option>
            <option>Twitter</option>
          </select>
        </div>
        <div className={styles.addFields}>
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
            className={styles.descRow}
            maxLength={MAX_DESCRIPTION_LENGTH}
            name="desc"
            placeholder="(optional) A description of what you use this account for."
          />
          <button>add</button>
        </div>
      </AntiCSRFForm>
      <div className={styles.buttonColumn}>
        <BsXLg onClick={close} size={24} strokeWidth={0.75} />
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  settingsURL: string
  status: string
}

const StatusBadge = ({ settingsURL, status }: StatusBadgeProps) => {
  return (
    <Link href={settingsURL}>
      <div className={`${styles.statusBadge} ${styles[status]}`}>{status}</div>
    </Link>
  )
}

const genExternalUrl = (platform: string, name: string) => {
  let url = 'https://'
  switch (platform) {
    case 'Twitter':
      return url + `twitter.com/${name}`
    case 'Twitch':
      return url + `twitch.tv/${name}`
    default:
      throw 'Invalid platform provided'
  }
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
      <div className={`${styles.platform} ${styles[platform]}`}>
        <PlatformBadge editable={!!editable} platform={platform} />
        {editable ? (
          <StatusBadge settingsURL={settingsURL} status={status} />
        ) : null}
      </div>
      <div className={styles.details}>
        <a
          className={styles.nameRow}
          href={genExternalUrl(platform, name)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {name}
        </a>
        {desc.length > 0 ? <div className={styles.descRow}>{desc}</div> : null}
      </div>
      {editable ? (
        <div className={styles.buttonColumn}>
          <Link href={settingsURL}>
            <BsGearFill size={24} />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default IdentityBox
