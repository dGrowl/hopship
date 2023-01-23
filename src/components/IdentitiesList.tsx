import { FormEvent, useContext, useState } from 'react'
import Link from 'next/link'

import { CSRFFormFields, Identity } from '../lib/types'
import { csrfHeaders, jsonHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'
import PlatformSelector from './PlatformSelector'
import UserContext from './UserContext'

import styles from '../styles/IdentitiesList.module.css'

enum Mode {
  NONE,
  VERIFY,
  DELETE,
}

type AddFormFields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
    name: HTMLInputElement
    platform: HTMLSelectElement
  }

const add = async (e: FormEvent) => {
  e.preventDefault()
  const form = e.target as AddFormFields
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

const update = async (
  csrf: string,
  verified: boolean,
  platform: string,
  name: string,
  descElement: HTMLTextAreaElement
) => {
  if (descElement.defaultValue !== descElement.value) {
    const data = { platform, name, desc: descElement.value, verified }
    await fetch('/api/identities', {
      method: 'PATCH',
      headers: csrfHeaders(csrf),
      body: JSON.stringify(data),
    })
    window.location.reload()
  }
}

const remove = async (
  csrf: string,
  verified: boolean,
  platform: string,
  name: string
) => {
  const data = { platform, name, verified }
  await fetch('/api/identities', {
    method: 'DELETE',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

const verify = async (
  csrf: string,
  platform: string,
  name: string,
  messageID: string
) => {
  const data = { platform, name, messageID }
  await fetch('/api/verify', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

type RowFields = EventTarget &
  CSRFFormFields & {
    desc: HTMLTextAreaElement
    name: HTMLInputElement
    platform: HTMLInputElement
    verified: HTMLInputElement
    messageID?: HTMLInputElement
  }

const rowSubmit = (e: FormEvent) => {
  e.preventDefault()
  const fields = e.target as RowFields
  const { csrf, desc, name, platform, verified, messageID } = fields
  const submit = e.nativeEvent as SubmitEvent
  const submitter = submit.submitter as HTMLInputElement | null
  const isVerified = verified.value === 't'
  switch (submitter?.value) {
    case 'Update':
      return update(csrf.value, isVerified, platform.value, name.value, desc)
    case 'Delete':
      return remove(csrf.value, isVerified, platform.value, name.value)
    case 'Verify':
      return verify(
        csrf.value,
        platform.value,
        name.value,
        messageID?.value || ''
      )
  }
}

interface InstructionsProps {
  platform: string
  url: string
  name: string
}

const Instructions = ({ platform, url, name }: InstructionsProps) => {
  let copyStep = null
  let extraSteps = null
  let example = null
  if (platform === 'Twitch') {
    const aboutURL = `https://twitch.tv/${name}/about`
    copyStep =
      'Add this URL (which redirects to your user page) to your About page. Note that if you wish, it can be invisible (like an image link).'
    example = (
      <>
        <div>
          Example (<Link href={aboutURL}>{aboutURL}</Link>):
        </div>
        <div className={`${styles.TwitchSnippet} ${styles.snippet}`}>
          Hey everyone, I&apos;m connecting my social accounts using Also!
          Follow my others at <Link href={url}>{url}</Link>!
        </div>
      </>
    )
  } else if (platform === 'Twitter') {
    copyStep = 'Post a tweet that includes this URL.'
    extraSteps = (
      <li>
        <p>Copy and paste the ID of that tweet here.</p>
        <p>
          https://twitter.com/{name}/status/
          <input name="tweetID" placeholder="123456789" />
        </p>
      </li>
    )
    example = (
      <>
        <div>Example:</div>
        <div className={`${styles.TwitterSnippet} ${styles.snippet}`}>
          Hey everyone, I&apos;m connecting my social accounts using Also!
          Follow my others at <Link href={url}>{url}</Link>!
        </div>
      </>
    )
  }
  return (
    <>
      <ol>
        <li>
          <p>{copyStep}</p>
          <p>
            <input value={url} readOnly />
          </p>
        </li>
        {extraSteps}
        <li>
          Press <input type="submit" value="Verify" />!
        </li>
      </ol>
      {example}
    </>
  )
}

interface VerificationPanelProps {
  platform: string
  platformName: string
}

const VerificationPanel = ({
  platform,
  platformName,
}: VerificationPanelProps) => {
  const userName = useContext(UserContext)
  const platformClass = `${platform}Extension`
  return (
    <div className={`${styles.extension} ${styles[platformClass]}`}>
      In order to verify this identity, follow these steps:
      <Instructions
        url={`https://also.domain/u/${userName}`}
        platform={platform}
        name={platformName}
      />
    </div>
  )
}

const toggle = (mode: Mode) => {
  return (prevMode: Mode) => (prevMode === mode ? Mode.NONE : mode)
}

interface RowProps {
  desc: string
  editable: boolean
  platform: string
  name: string
  verified?: boolean
}

const Row = ({ editable, platform, name, desc, verified }: RowProps) => {
  const [mode, setMode] = useState(Mode.NONE)
  const csrfCode = useCSRFCode()
  let extension = null
  if (mode === Mode.VERIFY) {
    extension = <VerificationPanel platform={platform} platformName={name} />
  }
  return (
    <form onSubmit={rowSubmit}>
      <input name="csrf" type="hidden" value={csrfCode} readOnly />
      <input
        name="verified"
        type="hidden"
        value={verified ? 't' : 'f'}
        readOnly
      />
      <input name="platform" type="hidden" value={platform} readOnly />
      <input name="name" type="hidden" value={name} readOnly />
      <div className={`${styles.row} ${styles[platform]}`}>
        {editable ? <div>{verified ? 'Yes' : 'No'}</div> : null}
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
          <div className={styles.editControls}>
            {verified ? null : (
              <input
                type="button"
                onClick={() => setMode(toggle(Mode.VERIFY))}
                value="Verify"
              />
            )}
            <input type="submit" value="Update" />
            <input type="submit" value="Delete" />
          </div>
        ) : null}
      </div>
      {extension}
    </form>
  )
}

const buildRows = (identities: Identity[], editable: boolean) =>
  identities.map((i) => (
    <Row key={i.platform + i.name} editable={editable} {...i} />
  ))

const AddRow = () => {
  const csrfCode = useCSRFCode()
  return (
    <form onSubmit={add}>
      <input name="csrf" type="hidden" value={csrfCode} readOnly />
      <div className={`${styles.row} ${styles.footerRow}`}>
        <div>—</div>
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
}

interface Props {
  editable?: boolean
  identities: Identity[]
}

const IdentitiesList = ({ identities, editable }: Props) => {
  editable = editable || false
  return (
    <div
      id={styles.identities}
      style={editable ? { gridTemplateColumns: 'auto auto auto 1fr auto' } : {}}
    >
      <div className={`${styles.row} ${styles.headerRow}`}>
        {editable ? <div>verified</div> : null}
        <div>platform</div>
        <div>id</div>
        <div>description</div>
        {editable ? <div>edit</div> : null}
      </div>
      {buildRows(identities, editable)}
      {editable ? <AddRow /> : null}
    </div>
  )
}

export default IdentitiesList
