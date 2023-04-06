import { ReactNode } from 'react'
import Link from 'next/link'

import styles from '../styles/SettingsContainer.module.css'

const PAGES = {
  Identities: '/settings',
  User: '/settings/user',
  Password: '/settings/password',
  Delete: '/settings/delete',
} as const

const buildLink = (page: string, route: string, active: string) => {
  return (
    <Link href={route} key={page}>
      {page === active ? (
        <li className={styles.current}>
          <b>{page}</b>
        </li>
      ) : (
        <li>{page}</li>
      )}
    </Link>
  )
}

interface SidebarProps {
  active: string
}

const Sidebar = ({ active }: SidebarProps) => {
  const links = Object.entries(PAGES).map(([page, route]) =>
    buildLink(page, route, active)
  )
  if (active.includes('/')) {
    const [platform, name] = active.split('/')
    links.splice(
      1,
      0,
      <Link href={`/settings/i/${platform}/${name}`} key={active}>
        <li className={styles.identity}>
          <div className={`${styles.identityDetails} ${styles[platform]}`}>
            <b>
              {platform} &#47;&#47;
              <br />
              {name}
            </b>
          </div>
        </li>
      </Link>
    )
  }
  return (
    <div id={styles.sidebar}>
      <ul>{links}</ul>
    </div>
  )
}

interface Props {
  active: string
  children: ReactNode
}

const SettingsContainer = ({ active, children }: Props) => {
  return (
    <div id={styles.container}>
      <Sidebar active={active} />
      <div id={styles.content}>{children}</div>
    </div>
  )
}

export default SettingsContainer
