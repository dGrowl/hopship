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

export type JsonObject = { [key: string]: JsonValue }

export type JsonValue =
  | boolean
  | number
  | string
  | JsonObject
  | Array<JsonValue>
  | null
