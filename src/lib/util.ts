import crypto from 'crypto'

export const jsonHeaders = new Headers({ 'Content-Type': 'application/json' })

export const csrfHeaders = (code: string) =>
  new Headers({
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': code,
  })

export const buildCookie = (k: string, v: string, age: number) =>
  [
    `${k}=${v}`,
    `Max-Age=${age}`,
    'Path=/',
    'SameSite=Lax',
    process.env.NODE_ENV !== 'development' ? 'Secure' : null,
  ].join('; ')

export const platforms: readonly string[] = ['Twitch', 'Twitter']

export const hasKey = (o: object, key: string) =>
  Object.prototype.hasOwnProperty.call(o, key)

export const clamp = (x: number, lower: number, upper: number) =>
  Math.min(Math.max(x, lower), upper)

export const genHexString = (nBytes: number) => {
  const bytes = crypto.randomBytes(nBytes)
  const bytestrings = Array.from(bytes).map((b) =>
    b.toString(16).padStart(2, '0')
  )
  return bytestrings.join('')
}

export const arrayToFirstString = (a: string | string[] | null) =>
  Array.isArray(a) ? a.slice(0, 1).join() : a

export const randomElement = <T>(a: T[]) =>
  a[Math.floor(Math.random() * a.length)]

export const doNothing = () => {}
