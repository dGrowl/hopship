import { FormEvent, MouseEvent, useContext, useState } from 'react'
import Link from 'next/link'

import { Identity } from '../lib/types'
import { jsonHeaders } from '../lib/util'
import PlatformSelector from './PlatformSelector'
import UserContext from './UserContext'

import styles from '../styles/IdentitiesList.module.css'

enum Mode {
  NONE,
  VERIFY,
  DELETE,
}

type AddFormFields = EventTarget & {
  platform: HTMLSelectElement
  name: HTMLInputElement
  desc: HTMLTextAreaElement
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

type EditFormFields = EventTarget & {
  desc: HTMLTextAreaElement
}

const updateDescription = async (
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

const remove = async (e: MouseEvent, platform: string, name: string) => {
  e.preventDefault()
  const data = { platform, name }
  await fetch('/api/identities', {
    method: 'DELETE',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
}

type VerifyFormFields = EventTarget & {
  name: HTMLInputElement
  tweetID?: HTMLInputElement
}

interface VerifyBody {
  platform: string
  name: string
  tweetID?: string
}

const verify = async (e: FormEvent, platform: string) => {
  e.preventDefault()
  const fields = e.target as VerifyFormFields
  const name = fields.name.value
  const data: VerifyBody = { platform, name }
  if (platform === 'Twitter') {
    data.tweetID = fields.tweetID?.value
  }
  await fetch('/api/verify', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })
  window.location.reload()
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
    <form onSubmit={(e) => verify(e, platform)}>
      <input name="name" type="hidden" value={name} readOnly />
      <ol>
        <li>
          <p>{copyStep}</p>
          <p>
            <input value={url} readOnly />
          </p>
        </li>
        {extraSteps}
        <li>
          Press <button>Submit</button>!
        </li>
      </ol>
      {example}
    </form>
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
  let extension = null
  if (mode === Mode.VERIFY) {
    extension = <VerificationPanel platform={platform} platformName={name} />
  }
  return (
    <>
      <form onSubmit={(e) => updateDescription(e, platform, name)}>
        <div className={`${styles.row} ${styles[platform]}`}>
          {editable ? <div>{verified ? 'Yes' : 'No'}</div> : null}
          <div>{platform}</div>
          <div>{name}</div>
          <div>
            {editable ? (
              <textarea
                name="desc"
                className={styles.desc}
                defaultValue={desc}
              />
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
              <input
                type="button"
                onClick={(e) => remove(e, platform, name)}
                value="Delete"
              />
            </div>
          ) : null}
        </div>
      </form>
      {extension}
    </>
  )
}

const buildRows = (identities: Identity[], editable: boolean) =>
  identities.map((i) => (
    <Row key={i.platform + i.name} editable={editable} {...i} />
  ))

const addRow = (
  <form onSubmit={add}>
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
      {editable ? addRow : null}
    </div>
  )
}

export default IdentitiesList
