import { FormEvent } from 'react'

import { CSRFFormFields, Identity, VerificationDetails } from '../lib/types'
import { csrfHeaders } from '../lib/util'
import AntiCSRFForm from './AntiCSRFForm'

import styles from '../styles/VerifyIdentityForm.module.css'

type Fields = EventTarget &
  CSRFFormFields & {
    url: HTMLInputElement
    messageID?: HTMLInputElement
  }

interface Proof {
  url: string
  messageID?: string
}

const buildProof = (platform: string, fields: Fields) => {
  const proof: Proof = {
    url: fields.url.value,
  }
  if (platform === 'Twitter' && fields.messageID) {
    proof.messageID = fields.messageID.value
  }
  return proof
}

const verify = async (
  e: FormEvent,
  platform: string,
  name: string,
  timestampMs: string
) => {
  e.preventDefault()
  const fields = e.target as Fields
  const csrf = fields.csrf.value
  const data = {
    platform,
    name,
    timestampMs,
    proof: buildProof(platform, fields),
  }
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
            required
            title="Tweet IDs can only contain digits."
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

const VerificationPending = () => {
  return (
    <p>
      You've successfully requested verification for this identity. We'll review
      your request soon!
    </p>
  )
}

interface Props {
  identity: Identity
  verification: VerificationDetails
}

const VerifyIdentityForm = ({ identity, verification }: Props) => {
  const { name, platform, status } = identity
  const { hash, timestampMs } = verification
  const url = `https://also.domain/u/name?v=${hash.substring(0, 16)}`
  return (
    <section>
      <h3>Verify</h3>
      {status === 'PENDING' ? (
        <VerificationPending />
      ) : (
        <AntiCSRFForm onSubmit={(e) => verify(e, platform, name, timestampMs)}>
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
            pages out at{' '}
            <a href={url} className="underline">
              {url}
            </a>
            !
          </div>
          <button>submit</button>
        </AntiCSRFForm>
      )}
    </section>
  )
}

export default VerifyIdentityForm
