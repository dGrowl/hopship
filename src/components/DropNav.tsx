import { useRouter } from 'next/router'

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
      <h2>{root} /</h2>
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
