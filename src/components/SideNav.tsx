import Link from 'next/link'

import { LinkDatum } from '../lib/types'

import styles from '../styles/SideNav.module.css'

interface Props {
  current: string
  linkData: LinkDatum[]
}

const SideNav = ({ current, linkData }: Props) => {
  return (
    <nav id={styles.container}>
      <ul>
        {linkData.map((l) => (
          <Link key={l.text} href={l.url}>
            <li className={l.url === current ? styles.current : ''}>
              {l.icon}
              <span>
                {l.text.includes('/') ? l.text.split('/').slice(-1) : l.text}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  )
}

export default SideNav
