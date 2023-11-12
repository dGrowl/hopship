'use client'

import { BsCheckLg, BsXLg } from 'react-icons/bs'
import { Dispatch, FormEvent, useState } from 'react'

import { CSRFFormFields } from '../../../lib/types'
import { csrfHeaders } from '../../../lib/util'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from '../../../lib/safety'
import AntiCSRFForm from '../../../components/AntiCSRFForm'
import Explanation from '../../../components/Explanation'
import Field from '../../../components/Field'

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
      email: email.value || undefined,
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
        <Explanation cause="success">
          <BsCheckLg />
          <span>Your message was successfully submitted. Thank you!</span>
        </Explanation>
      )
    case false:
      return (
        <Explanation cause="error">
          <BsXLg />
          <span>
            Your message couldn&apos;t be sent. Please try again later and, if
            the issue persists, get in touch via{' '}
            <a href="https://github.com/dGrowl/hopship" className="underline">
              GitHub
            </a>
            .
          </span>
        </Explanation>
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
              style={{ height: '128px' }}
            />
          </Field>
          {getResultElement(success)}
        </AntiCSRFForm>
      </section>
    </article>
  )
}

export default ContactForm
