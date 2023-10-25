import { JwtPayload } from 'jsonwebtoken'
import { ReactElement } from 'react'
import { useRouter } from 'next/navigation'

export interface Identity {
  desc: string
  name: string
  network: string
  platform: string
  status: string
}

export interface LinkDatum {
  icon: ReactElement
  text: string
  url: string
}

export interface AuthPayload extends JwtPayload {
  sub: string
  email: string
}

export interface CSRFPayload extends JwtPayload {
  sub: string
  code: string
}

export interface CSRFFormFields {
  csrf: HTMLInputElement
}

export interface VerificationDetails {
  hash: string
  timestampMs: string
}

export interface PostgresError {
  length: number
  severity: 'ERROR' | 'FATAL' | 'PANIC'
  code: string
  detail: string
  hint?: string
  position?: number
  internalPosition?: number
  internalQuery?: string
  where?: string
  schema: string
  table: string
  column: string
  dataType?: string
  constraint?: string
  file: string
  line: string
  routine: string
}

export type AppRouter = ReturnType<typeof useRouter>
