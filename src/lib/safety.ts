import { Literal, String, Union } from '@sinclair/typebox'

import { NETWORKS } from './util'
import { PostgresError } from './types'

export const sanitizeName = (name: string) => name.toLowerCase()

export const ARGON_OPTIONS = {
  memoryCost: 16384, // 2^14
  timeCost: 64,
} as const

export const parsePostgresError = (error: PostgresError) => {
  switch (error.constraint) {
    case 'users_email_key':
      return 'PG_DUPLICATE_EMAIL'
    case 'users_name_key':
      return 'PG_DUPLICATE_USER_NAME'
    default:
      return 'PG_UNKNOWN'
  }
}

export const USER_NAME_MAX_LENGTH = 24
export const USER_NAME_MIN_LENGTH = 1
export const USER_NAME_REGEX = `\\w+`
export const UserNameType = String({
  maxLength: USER_NAME_MAX_LENGTH,
  minLength: USER_NAME_MIN_LENGTH,
  pattern: `^${USER_NAME_REGEX}$`,
})

export const EMAIL_MAX_LENGTH = 256
export const EMAIL_MIN_LENGTH = 3
export const EMAIL_REGEX = `.+@.+`
export const EmailType = String({
  maxLength: EMAIL_MAX_LENGTH,
  minLength: EMAIL_MIN_LENGTH,
  pattern: `^${EMAIL_REGEX}$`,
})

export const PASSWORD_MAX_LENGTH = 4096
export const PASSWORD_MIN_LENGTH = 8
export const PasswordType = String({
  maxLength: PASSWORD_MAX_LENGTH,
  minLength: PASSWORD_MIN_LENGTH,
})

export const MESSAGE_MAX_LENGTH = 2048
export const MESSAGE_MIN_LENGTH = 2
export const MessageType = String({
  maxLength: MESSAGE_MAX_LENGTH,
  minLength: MESSAGE_MIN_LENGTH,
})

export const BIO_MAX_LENGTH = 64
export const BIO_REGEX = `[\\u0020-\\u007E]*`

export const NETWORK_MAX_LENGTH = NETWORKS.reduce(
  (len, p) => (p.length > len ? p.length : len),
  0
)
export const NETWORK_REGEX = `[a-zA-Z]+\.[a-zA-Z]+`
export const NetworkType = Union([
  Literal('bsky.social'),
  Literal('mastodon.social'),
  Literal('mstdn.social'),
  Literal('threads.net'),
  Literal('twitch.tv'),
  Literal('twitter.com'),
  Literal('youtube.com'),
])

export const NETWORK_NAME_MAX_LENGTH = 64
export const NETWORK_NAME_MIN_LENGTH = 1
export const NETWORK_NAME_REGEX = `\\w+`
export const NetworkNameType = String({
  maxLength: NETWORK_NAME_MAX_LENGTH,
  minLength: NETWORK_NAME_MIN_LENGTH,
  pattern: `^${NETWORK_NAME_REGEX}$`,
})

export const DESCRIPTION_MAX_LENGTH = 48
export const DESCRIPTION_REGEX = BIO_REGEX
export const DescriptionType = String({
  maxLength: DESCRIPTION_MAX_LENGTH,
  pattern: `^${DESCRIPTION_REGEX}$`,
})
