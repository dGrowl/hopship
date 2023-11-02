'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  AppRouter,
  CSRFFormFields,
  Identity,
  VerificationDetails,
} from '../../../../lib/types'
import { buildMessageURL, csrfHeaders } from '../../../../lib/util'
import { HOME_DOMAIN } from '../../../../lib/env'
import AntiCSRFForm from '../../../../components/AntiCSRFForm'
import Preview from '../../../../components/Preview'

import styles from '../../../../styles/VerifyIdentityForm.module.css'

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
  if (fields.messageID) {
    proof.messageID = fields.messageID.value
  }
  return proof
}

const verify = async (
  e: FormEvent,
  router: AppRouter,
  identity: Identity,
  timestampMs: string
) => {
  e.preventDefault()
  const fields = e.target as Fields
  const csrf = fields.csrf.value
  const { platform, network, name } = identity
  const data = {
    network,
    name,
    timestampMs,
    proof: buildProof(platform, fields),
  }
  await fetch('/api/verify', {
    method: 'POST',
    headers: csrfHeaders(csrf),
    body: JSON.stringify(data),
  })
  router.refresh()
}

interface PlatformDetails {
  placeholder: string
  pattern: string
  title: string
}

const platformDetails: { [platform: string]: PlatformDetails } = {
  Bluesky: {
    placeholder: 'abc123',
    pattern: '[a-z\\d]+',
    title:
      'Bluesky message IDs can only contain digits and lower-case letters.',
  },
  Mastodon: {
    placeholder: '123',
    pattern: '\\d+',
    title: 'Mastodon message IDs can only contain digits.',
  },
  Threads: {
    placeholder: 'abcDEF123',
    pattern: '[a-zA-Z\\d]+',
    title: 'Threads message IDs can only contain digits and letters.',
  },
  Twitter: {
    placeholder: '123',
    pattern: '\\d+',
    title: 'Twitter message IDs can only contain digits.',
  },
}

interface InstructionsProps {
  platform: string
  network: string
  name: string
  url: string
}

const MessageInstructions = ({
  platform,
  network,
  name,
  url,
}: InstructionsProps) => {
  const [messageID, setMessageID] = useState('')
  const details = platformDetails[platform]
  return (
    <>
      <li>
        Post a message that contains this URL (which redirects to your user
        page).
        <p>
          <input name="url" value={url} readOnly />
        </p>
      </li>
      <li>
        Copy and paste the ID of that message into this field.
        <input
          name="messageID"
          onChange={(e) => setMessageID(e.target.value)}
          required
          value={messageID}
          {...details}
        />
        <Preview>
          {buildMessageURL(
            platform,
            network,
            name,
            messageID || details.placeholder
          )}
        </Preview>
      </li>
    </>
  )
}

const BioInstructions = ({ url }: InstructionsProps) => {
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

const supportsMessages = ['Bluesky', 'Mastodon', 'Threads', 'Twitter']

const supportsBios = ['Twitch', 'YouTube']

const Instructions = (props: InstructionsProps) => {
  if (supportsMessages.includes(props.platform)) {
    return <MessageInstructions {...props} />
  }
  if (supportsBios.includes(props.platform)) {
    return <BioInstructions {...props} />
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
      You&apos;ve successfully requested verification for this identity.
      We&apos;ll review your request soon!
    </p>
  )
}

interface Props {
  identity: Identity
  verification: VerificationDetails
}

const VerifyIdentityForm = ({ identity, verification }: Props) => {
  const router = useRouter()
  const { platform, status } = identity
  const { hash, timestampMs } = verification
  const url = `https://${HOME_DOMAIN}/u/name?v=${hash.substring(0, 16)}`
  return (
    <section>
      <h3>Verify</h3>
      {status === 'PENDING' ? (
        <VerificationPending />
      ) : (
        <AntiCSRFForm
          onSubmit={(e) => verify(e, router, identity, timestampMs)}
        >
          To verify that this {platform} account belongs to you:
          <ol className={styles.instructions}>
            <Instructions {...identity} url={url} />
            <li>
              Hit the <b>request</b> button below.
            </li>
          </ol>
          <div>Example:</div>
          <div className={`${styles.example} ${styles[platform + 'Example']}`}>
            Hey everyone, I&apos;m linking accounts using hopship! Check my
            other pages out at{' '}
            <a href={url} className="underline">
              {url}
            </a>
            !
          </div>
          <button>request</button>
        </AntiCSRFForm>
      )}
    </section>
  )
}

export default VerifyIdentityForm
