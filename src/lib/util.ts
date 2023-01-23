import crypto from 'crypto'

export const jsonHeaders = new Headers({ 'Content-Type': 'application/json' })

export const csrfHeaders = (code: string) =>
  new Headers({
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': code,
  })

export const platforms = ['Twitch', 'Twitter'] as const

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
