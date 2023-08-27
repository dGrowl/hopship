import { NETWORKS } from './util'

export const sanitizeName = (name: string) => name.toLowerCase()

export const ARGON_OPTIONS = {
  memoryCost: 16384, // 2^14
  timeCost: 64,
} as const

export const USER_NAME_MAX_LENGTH = 24
export const USER_NAME_MIN_LENGTH = 1
export const USER_NAME_REGEX = `\\w+`

export const EMAIL_MAX_LENGTH = 256
export const EMAIL_MIN_LENGTH = 3
export const EMAIL_REGEX = `^.+@.+$`

export const PASSWORD_MAX_LENGTH = 4096
export const PASSWORD_MIN_LENGTH = 8

export const BIO_MAX_LENGTH = 64
export const BIO_REGEX = `^[a-zA-Z\d,;:''" \.\+\-\*\/\&%()?!]*$`

export const NETWORK_MAX_LENGTH = NETWORKS.reduce(
  (len, p) => (p.length > len ? p.length : len),
  0
)

export const NETWORK_NAME_MAX_LENGTH = 64
export const NETWORK_NAME_MIN_LENGTH = 1
export const NETWORK_NAME_REGEX = `\\w+`

export const DESCRIPTION_MAX_LENGTH = 48
export const DESCRIPTION_REGEX = BIO_REGEX
