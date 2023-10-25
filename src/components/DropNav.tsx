'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { LinkDatum } from '../lib/types'

import styles from '../styles/DropNav.module.css'

interface Props {
  current: string
  linkData: LinkDatum[]
  root: string
}

const DropNav = ({ current, linkData, root }: Props) => {
  const router = useRouter()
  return (
    <nav id={styles.container}>
      <Link href={linkData[0].url}>
        <h2>{root} /</h2>
      </Link>
      <select
        defaultValue={current}
        key={current}
        onChange={(e) => router.push(e.target.value)}
      >
        {linkData.map((l) => (
          <option key={l.text} value={l.url}>
            {l.text}
          </option>
        ))}
      </select>
    </nav>
  )
}

export default DropNav
