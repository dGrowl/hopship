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

export const PLATFORM_NETWORKS: { [platform: string]: string[] } = {
  Bluesky: ['bsky.social'],
  Mastodon: ['mastodon.social', 'mstdn.social'],
  Threads: ['threads.net'],
  Twitch: ['twitch.tv'],
  Twitter: ['twitter.com'],
  YouTube: ['youtube.com'],
}

export const NETWORK_PLATFORM = Object.entries(PLATFORM_NETWORKS).reduce(
  (o, [p, ns]) => {
    if (Array.isArray(ns)) {
      ns.forEach((n) => (o[n] = p))
    } else {
      o[ns[0]] = p
    }
    return o
  },
  {} as { [network: string]: string }
)

export const PLATFORMS: readonly string[] = Object.keys(PLATFORM_NETWORKS)

export const NETWORKS: readonly string[] =
  Object.values(PLATFORM_NETWORKS).flat()

export const DECENTRALIZED_NETWORKS: readonly string[] = Object.values(
  PLATFORM_NETWORKS
)
  .filter((n) => n.length > 1)
  .flat()

export const getSpecificNetworkName = (network: string) =>
  DECENTRALIZED_NETWORKS.includes(network) ? network : NETWORK_PLATFORM[network]

export const buildProfileURL = (
  platform: string,
  network: string,
  name: string
) => {
  let url = `https://`
  if (platform === 'Bluesky') {
    return url + `bsky.app/profile/${name}.${network}`
  }
  url += network
  if (
    platform === 'Mastodon' ||
    platform === 'Threads' ||
    platform === 'YouTube'
  ) {
    return url + `/@${name}`
  }
  return url + `/${name}`
}

export const buildMessageURL = (
  platform: string,
  network: string,
  name: string,
  messageID: string
) => {
  let url = buildProfileURL(platform, network, name).slice(8)
  switch (platform) {
    case 'Bluesky':
      return url + `/post/${messageID}`
    case 'Mastodon':
      return url + `/${messageID}`
    case 'Threads':
      return url + `/post/${messageID}`
    case 'Twitter':
      return url + `/status/${messageID}`
  }
  return 'Invalid platform. Please tell a dev that you saw this!'
}

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

export const objectReducer = <T>(s: T, a: object): T => ({ ...s, ...a })
