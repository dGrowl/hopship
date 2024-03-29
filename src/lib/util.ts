export const jsonHeaders = new Headers({ 'Content-Type': 'application/json' })

export const csrfHeaders = (code: string) =>
  new Headers({
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': code,
  })

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

export const genHexString = (nBytes: number) => {
  const bytes = new Uint8Array(nBytes)
  self.crypto.getRandomValues(bytes)
  const bytestrings = Array.from(bytes).map((b) =>
    b.toString(16).padStart(2, '0')
  )
  return bytestrings.join('')
}

export const objectReducer = <T>(s: T, a: object): T => ({ ...s, ...a })

export const cleanSpaces = (s: string) => {
  s = s.replaceAll(/ {2,}/g, ' ')
  if (s[0] === ' ') {
    s = s.slice(1)
  }
  if (s.slice(-1) === ' ') {
    s = s.slice(0, -1)
  }
  return s
}

export const secsRemaining = (timestampSecs: number) =>
  timestampSecs - Date.now() / 1000
