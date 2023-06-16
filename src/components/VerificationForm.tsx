import { FormEvent } from 'react'

import { CSRFFormFields } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import { useCSRFCode } from '../lib/safety'

import styles from '../styles/VerificationForm.module.css'

type Fields = EventTarget &
  CSRFFormFields & {
    url: HTMLInputElement
    messageID?: HTMLInputElement
  }

const verify = async (e: FormEvent, platform: string, name: string) => {
  e.preventDefault()
  const fields = e.target as Fields
  const csrf = fields.csrf.value
  const url = fields.url.value
  const data = { platform, name, url }
  await fetch('/api/verify', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  window.location.reload()
}

interface PlatformProps {
  name: string
  url: string
}

const TwitterInstructions = ({ name, url }: PlatformProps) => {
  return (
    <>
      <li>
        Post a tweet that contains this URL (which redirects to your user page).
        <p>
          <input name="url" value={url} readOnly />
        </p>
      </li>
      <li>
        Copy and paste the ID of that tweet into this field.
        <p className={styles.TwitterMessageRow}>
          twitter.com/{name}/status/
          <input
            name="messageID"
            pattern="\d+"
            placeholder="123456789"
            title="Tweet IDs can only contain digits."
            required
          />
        </p>
      </li>
    </>
  )
}

const TwitchInstructions = ({ name, url }: PlatformProps) => {
  return (
    <>
      <li>
        Add this URL (which redirects to your user page) anywhere in your About
        panel.
        <p>
          <input name="url" value={url} readOnly />
        </p>
      </li>
    </>
  )
}

interface InstructionsProps extends PlatformProps {
  platform: string
}

const Instructions = ({ platform, name, url }: InstructionsProps) => {
  switch (platform) {
    case 'Twitch':
      return <TwitchInstructions name={name} url={url} />
    case 'Twitter':
      return <TwitterInstructions name={name} url={url} />
  }
  return (
    <li>
      Turn back, because these instructions should never be shown. Please let
      the developer know you saw this!
    </li>
  )
}

interface Props {
  platform: string
  name: string
}

const VerificationForm = ({ platform, name }: Props) => {
  const csrfCode = useCSRFCode()
  const hash = 'e2a464cf'
  const url = `https://also.domain/u/name?v=${hash}`
  return (
    <section>
      <b>Verify</b>
      <form onSubmit={(e) => verify(e, platform, name)}>
        <fieldset>
          <input name="csrf" type="hidden" value={csrfCode} readOnly />
          To verify that this {platform} account belongs to you:
          <ol>
            <Instructions platform={platform} name={name} url={url} />
            <li>
              Hit the <b>verify</b> button below.
            </li>
          </ol>
          <div>Example:</div>
          <div className={`${styles.example} ${styles[platform + 'Example']}`}>
            Hey everyone, I&apos;m linking accounts using Also! Check my other
            pages out at <a href={url}>{url}</a>!
          </div>
          <button>submit</button>
        </fieldset>
      </form>
    </section>
  )
}

export default VerificationForm
