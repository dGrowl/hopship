import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '../styles/SettingsContainer.module.css'

const PAGES: { [label: string]: string } = {
  Identities: '/settings',
  User: '/settings/user',
  Password: '/settings/password',
  Delete: '/settings/delete',
} as const

const getPageRoute = (page: string) => PAGES[page] || `/settings/i/${page}`

const buildLink = (page: string, route: string, active: string) => (
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

interface NavProps {
  active: string
}

const SideNav = ({ active }: NavProps) => {
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
    <nav id={styles.sidebar}>
      <ul>{links}</ul>
    </nav>
  )
}

const DropNav = ({ active }: NavProps) => {
  const router = useRouter()
  const links = Object.entries(PAGES).map(([page, route]) => (
    <option key={page} value={route}>
      {page}
    </option>
  ))
  if (active.includes('/')) {
    const [platform, name] = active.split('/')
    links.splice(
      1,
      0,
      <option
        className={styles.indent}
        key={active}
        value={`/settings/i/${active}`}
      >
        {platform} &#47;&#47; {name}
      </option>
    )
  }
  return (
    <nav id={styles.dropNav}>
      <h2>Settings &gt;</h2>
      <select
        defaultValue={getPageRoute(active)}
        onChange={(e) => router.push(e.target.value)}
      >
        {links}
      </select>
    </nav>
  )
}

interface Props {
  active: string
  children: ReactNode
}

const SettingsContainer = ({ active, children }: Props) => {
  return (
    <div id={styles.container}>
      <SideNav active={active} />
      <DropNav active={active} />
      <div id={styles.content}>{children}</div>
    </div>
  )
}

export default SettingsContainer
