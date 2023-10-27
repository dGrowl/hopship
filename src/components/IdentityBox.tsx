'use client'

import {
  BsCloudSunFill,
  BsGearFill,
  BsHurricane,
  BsMastodon,
  BsQuestionCircle,
  BsTwitch,
  BsTwitter,
  BsXLg,
  BsYoutube,
} from 'react-icons/bs'
import { FormEvent, useState } from 'react'
import Link from 'next/link'

import { CSRFFormFields, Identity } from '../lib/types'
import {
  buildProfileURL,
  cleanSpaces,
  csrfHeaders,
  DECENTRALIZED_NETWORKS,
  PLATFORM_NETWORKS,
  PLATFORMS,
} from '../lib/util'
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_REGEX,
  NETWORK_NAME_MAX_LENGTH,
  NETWORK_NAME_MIN_LENGTH,
  NETWORK_NAME_REGEX,
} from '../lib/safety'
import AntiCSRFForm from './AntiCSRFForm'
import ValidatedTextArea from './ValidatedTextArea'

import styles from '../styles/IdentityBox.module.css'

const getPlatformBadge = (platform: string, size: string) => {
  switch (platform) {
    case 'Bluesky':
      return <BsCloudSunFill size={size} />
    case 'Mastodon':
      return <BsMastodon size={size} />
    case 'Threads':
      return <BsHurricane size={size} />
    case 'Twitter':
      return <BsTwitter size={size} />
    case 'Twitch':
      return <BsTwitch size={size} />
    case 'YouTube':
      return <BsYoutube size={size} />
  }
  return <BsQuestionCircle size={size} />
}

type AddFields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
    name: HTMLInputElement
    platform: HTMLSelectElement
    network?: HTMLSelectElement
  }

const add = async (e: FormEvent) => {
  e.preventDefault()
  const form = e.target as AddFields
  const csrf = form.csrf.value
  const desc = cleanSpaces(form.desc.value)
  const name = form.name.value
  const platform = form.platform.value
  const network = form.network?.value || PLATFORM_NETWORKS[platform][0]
  const data = { platform, network, name, desc }
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
  const [platform, setPlatform] = useState(PLATFORMS[0])
  const networks = PLATFORM_NETWORKS[platform]
  return (
    <div className={`${styles.container} ${styles[platform]}`}>
      <AntiCSRFForm onSubmit={add}>
        <div className={styles.platform}>
          {getPlatformBadge(platform, '36px')}
          <select
            id={styles.addSelector}
            name="platform"
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className={styles.addFields}>
          {networks.length > 1 ? (
            <select name="network">
              {networks.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          ) : null}
          <input
            maxLength={NETWORK_NAME_MAX_LENGTH}
            minLength={NETWORK_NAME_MIN_LENGTH}
            name="name"
            pattern={NETWORK_NAME_REGEX}
            placeholder={`${platform} name`}
            required
            title={`${platform} IDs can only contain letters, numbers, and underscores.`}
          />
          <ValidatedTextArea
            className={styles.descRow}
            maxLength={DESCRIPTION_MAX_LENGTH}
            name="desc"
            pattern={DESCRIPTION_REGEX}
            placeholder="(optional) A description of what you use this identity for."
          />
          <button>add</button>
        </div>
      </AntiCSRFForm>
      <div className={styles.buttonColumn}>
        <BsXLg className="iconLink" onClick={close} />
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
      <div className={styles[status]}>{status}</div>
    </Link>
  )
}

interface Props extends Identity {
  editable?: boolean
}

const IdentityBox = ({
  desc,
  editable,
  name,
  network,
  platform,
  status,
}: Props) => {
  const settingsURL = `/settings/${network}/${name}`
  return (
    <div className={`${styles.container} ${styles[platform]}`}>
      <div className={styles.platform}>
        {getPlatformBadge(platform, editable ? '36px' : '44px')}
        {editable ? (
          <StatusBadge settingsURL={settingsURL} status={status} />
        ) : null}
      </div>
      <div className={styles.details}>
        <a
          className={styles.nameRow}
          href={buildProfileURL(platform, network, name)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {DECENTRALIZED_NETWORKS.includes(network) ? (
            <p style={{ fontSize: '.8rem' }}>{network}</p>
          ) : null}
          {name}
        </a>
        {desc.length > 0 ? <div className={styles.descRow}>{desc}</div> : null}
      </div>
      {editable ? (
        <div className={styles.buttonColumn}>
          <Link href={settingsURL}>
            <BsGearFill className="iconLink" />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default IdentityBox
