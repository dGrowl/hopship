import { JwtPayload } from 'jsonwebtoken'

export interface Identity {
  verified?: boolean
  platform: string
  name: string
  desc: string
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
