import { NETWORKS } from './util'

export const sanitizeName = (name: string) => name.toLowerCase()

export const ARGON_OPTIONS = {
  memoryCost: 16384, // 2^14
  timeCost: 64,
} as const

export const MAX_USER_NAME_LENGTH = 24

export const MIN_PASSWORD_LENGTH = 8

export const MAX_PASSWORD_LENGTH = 4096

export const MAX_BIO_LENGTH = 64

export const MAX_NETWORK_LENGTH = NETWORKS.reduce(
  (len, p) => (p.length > len ? p.length : len),
  0
)

export const MAX_NETWORK_NAME_LENGTH = 64

export const DESCRIPTION_REGEX = /^[a-zA-Z\d,;:''" \.\+\-\*\/\&%()?!]*$/

export const MAX_DESCRIPTION_LENGTH = 48
