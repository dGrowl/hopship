const onServer = typeof window === 'undefined'

const load = (variable: string) => {
  const value = process.env[variable]
  if (!value && onServer) {
    throw `Failed to load environment variable ${variable}`
  }
  return value || ''
}

export const HOME_DOMAIN = 'hopship.social'
export const JWT_AUTH_SECRET = load('JWT_AUTH_SECRET')
export const PG_CONN = load('PG_CONN')
export const VERIFICATION_SECRET = load('VERIFICATION_SECRET')
