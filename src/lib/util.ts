export const jsonHeaders = new Headers({ 'Content-Type': 'application/json' })

export const platforms = ['Twitch', 'Twitter'] as const

export const hasKey = (o: object, key: string) =>
  Object.prototype.hasOwnProperty.call(o, key)

export const clamp = (x: number, lower: number, upper: number) =>
  Math.min(Math.max(x, lower), upper)
