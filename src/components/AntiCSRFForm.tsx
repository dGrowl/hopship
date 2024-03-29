import {
  DetailedHTMLProps,
  FormHTMLAttributes,
  useEffect,
  useState,
} from 'react'
import * as jose from 'jose'

import { CSRFPayload } from 'lib/api'

const csrfCookieRegex = /csrf=([a-zA-Z0-9-_.]+)/

const useCSRFCode = () => {
  const [code, setCode] = useState('')
  useEffect(() => {
    const match = document.cookie.match(csrfCookieRegex)
    const token = match ? match[1] : null
    if (!token) return
    try {
      const payload = jose.decodeJwt<CSRFPayload>(token)
      setCode(payload.code || '')
    } catch (error) {
      console.error('Failed to decode CSRF token')
    }
  }, [])
  return code
}

const AntiCSRFForm = ({
  children,
  ...formProps
}: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>) => {
  const csrfCode = useCSRFCode()
  return (
    <form {...formProps}>
      <fieldset>
        <input name="csrf" type="hidden" value={csrfCode} readOnly />
        {children}
      </fieldset>
    </form>
  )
}

export default AntiCSRFForm
