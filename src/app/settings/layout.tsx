'use client'

import {
  BsCloudSunFill,
  BsKeyFill,
  BsMastodon,
  BsPersonCheckFill,
  BsPersonVcard,
  BsThreads,
  BsTrash3Fill,
  BsTwitch,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs'
import { ReactElement, ReactNode } from 'react'
import { redirect, usePathname } from 'next/navigation'

import { LinkDatum } from 'lib/types'
import { NETWORK_NAME_REGEX, NETWORK_REGEX } from 'lib/safety'
import { NETWORK_PLATFORM } from 'lib/util'
import DropNav from 'components/DropNav'
import SideNav from 'components/SideNav'

import styles from 'styles/Settings.module.css'

const PLATFORM_ICONS: Record<string, ReactElement> = {
  Bluesky: <BsCloudSunFill className={styles.Bluesky} />,
  Mastodon: <BsMastodon className={styles.Mastodon} />,
  Threads: <BsThreads className={styles.Threads} />,
  Twitch: <BsTwitch className={styles.Twitch} />,
  Twitter: <BsTwitter className={styles.Twitter} />,
  YouTube: <BsYoutube className={styles.YouTube} />,
} as const

const LINK_DATA = [
  {
    icon: <BsPersonVcard />,
    text: 'identities',
    url: '/settings/identities',
  },
  {
    icon: <BsPersonCheckFill />,
    text: 'user',
    url: '/settings/user',
  },
  {
    icon: <BsKeyFill />,
    text: 'password',
    url: '/settings/password',
  },
  {
    icon: <BsTrash3Fill />,
    text: 'delete',
    url: '/settings/delete',
  },
] as readonly LinkDatum[]

const buildIdentityLinkDatum = (
  url: string,
  network: string,
  networkName: string
) => {
  const platform = NETWORK_PLATFORM[network]
  return {
    icon: PLATFORM_ICONS[platform],
    text: `${network}/${networkName}`,
    url,
  }
}

interface Props {
  children: ReactNode
}

const SettingsLayout = ({ children }: Props) => {
  const path = usePathname() || '/'
  const route = path.match(
    `^\/settings\/([a-zA-Z\.]+|${NETWORK_REGEX})\/?(${NETWORK_NAME_REGEX})?$`
  )
  if (!route) {
    return redirect('/')
  }
  const [current, network, networkName] = route
  const linkData = [...LINK_DATA]
  if (networkName) {
    linkData.splice(1, 0, buildIdentityLinkDatum(current, network, networkName))
  }
  return (
    <div id={styles.container}>
      <SideNav current={current} linkData={linkData} />
      <DropNav current={current} root="Settings" linkData={linkData} />
      {children}
    </div>
  )
}

export default SettingsLayout
