import { JwtPayload } from 'jsonwebtoken'
import { ReactElement } from 'react'

export interface Identity {
  desc: string
  name: string
  platform: string
  status: string
}

export interface LinkDatum {
  icon: ReactElement
  text: string
  title: string
  url: string
}

export interface AuthPayload extends JwtPayload {
  name: string
  email: string
}

export interface CSRFPayload extends JwtPayload {
  code: string
}

export interface CSRFFormFields {
  csrf: HTMLInputElement
}

export interface VerificationDetails {
  hash: string
  timestampMs: string
}
