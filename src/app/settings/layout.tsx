'use client'

import {
  BsCloudSunFill,
  BsHurricane,
  BsKeyFill,
  BsMastodon,
  BsPersonCheckFill,
  BsPersonVcard,
  BsTrash3Fill,
  BsTwitch,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs'
import { ReactElement, ReactNode } from 'react'
import { redirect, usePathname } from 'next/navigation'

import { LinkDatum } from '../../lib/types'
import { NETWORK_NAME_REGEX, NETWORK_REGEX } from '../../lib/safety'
import { NETWORK_PLATFORM } from '../../lib/util'
import DropNav from '../../components/DropNav'
import SideNav from '../../components/SideNav'

import styles from '../../styles/Settings.module.css'

const PLATFORM_ICONS: Record<string, ReactElement> = {
  Bluesky: <BsCloudSunFill className={styles.Bluesky} />,
  Mastodon: <BsMastodon className={styles.Mastodon} />,
  Threads: <BsHurricane className={styles.Threads} />,
  Twitch: <BsTwitch className={styles.Twitch} />,
  Twitter: <BsTwitter className={styles.Twitter} />,
  YouTube: <BsYoutube className={styles.YouTube} />,
} as const

const LINK_DATA: Record<string, LinkDatum> = {
  identities: {
    icon: <BsPersonVcard />,
    text: 'identities',
    url: '/settings/identities',
  },
  user: {
    icon: <BsPersonCheckFill />,
    text: 'user',
    url: '/settings/user',
  },
  password: {
    icon: <BsKeyFill />,
    text: 'password',
    url: '/settings/password',
  },
  delete: {
    icon: <BsTrash3Fill />,
    text: 'delete',
    url: '/settings/delete',
  },
} as const

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
  page: string
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
  const linkData = Object.values(LINK_DATA)
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
