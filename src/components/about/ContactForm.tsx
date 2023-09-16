import { BsCheckLg, BsXLg } from 'react-icons/bs'
import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../../lib/types'
import { csrfHeaders } from '../../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from '../../lib/safety'
import AntiCSRFForm from '../AntiCSRFForm'
import Field from '../Field'

import styles from '../../styles/ContactForm.module.css'

interface Fields extends CSRFFormFields, EventTarget {
  email: HTMLInputElement
  message: HTMLTextAreaElement
}

const send = async (e: FormEvent, setSuccess: Dispatch<boolean | null>) => {
  e.preventDefault()
  const { csrf, email, message } = e.target as Fields
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: csrfHeaders(csrf.value),
    body: JSON.stringify({
      email: email.value,
      message: message.value,
    }),
  })
  setSuccess(response.status === 200)
}

const getResultElement = (success: boolean | null) => {
  switch (success) {
    case null:
      return <button>send</button>
    case true:
      return (
        <div className={`${styles.result} ${styles.good}`}>
          <BsCheckLg size={32} />
          <p>Your message was successfully submitted. Thank you!</p>
        </div>
      )
    case false:
      return (
        <div className={`${styles.result} ${styles.bad}`}>
          <BsXLg size={26} strokeWidth={0.8} style={{ paddingLeft: '4px' }} />
          <p>
            Your message couldn&apos;t be sent. Please try again later and, if
            the issue persists, get in touch via{' '}
            <a href="https://github.com/dGrowl/hopship" className="underline">
              GitHub
            </a>
            .
          </p>
        </div>
      )
  }
}

const ContactForm = () => {
  const [success, setSuccess] = useState<boolean | null>(null)
  return (
    <article>
      <section>
        <p>
          If you&apos;d like to contact the <b>hopship</b> team, enter a message
          below. Make sure to include your email address if you want a response.
        </p>
        <AntiCSRFForm onSubmit={(e) => send(e, setSuccess)}>
          <Field name="email" label="email (optional)">
            <input
              autoComplete="email"
              disabled={success !== null}
              id="email"
              maxLength={EMAIL_MAX_LENGTH}
              name="email"
              pattern={EMAIL_REGEX}
              type="email"
            />
          </Field>
          <Field name="message">
            <textarea
              disabled={success !== null}
              id="message"
              maxLength={MESSAGE_MAX_LENGTH}
              minLength={MESSAGE_MIN_LENGTH}
              name="message"
              required
            />
          </Field>
          {getResultElement(success)}
        </AntiCSRFForm>
      </section>
    </article>
  )
}

export default ContactForm
